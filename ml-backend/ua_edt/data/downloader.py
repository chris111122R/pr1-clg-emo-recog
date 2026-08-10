import os
import hashlib
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import requests
from tqdm import tqdm

logger = logging.getLogger(__name__)

class DatasetManager:
    """
    Manages datasets downloading, caching, checksum verification, and versioning.
    Supports environment variable overrides for local paths.
    """
    def __init__(self, cache_dir: Optional[str] = None):
        self.cache_dir = Path(cache_dir or os.environ.get("UA_EDT_DATA_DIR", "./data"))
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_file = self.cache_dir / "dataset_metadata.json"
        self._load_metadata()

    def _load_metadata(self):
        if self.metadata_file.exists():
            with open(self.metadata_file, "r") as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {}

    def _save_metadata(self):
        with open(self.metadata_file, "w") as f:
            json.dump(self.metadata, f, indent=4)

    def verify_checksum(self, filepath: Path, expected_md5: str) -> bool:
        """Verifies MD5 checksum of a file."""
        if not filepath.exists():
            return False
        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest() == expected_md5

    def download_file(self, url: str, dest: Path, expected_md5: Optional[str] = None, resume: bool = True) -> bool:
        """Downloads a file with resume support and chunked writing."""
        # Check local override first
        if os.environ.get(f"UA_EDT_{dest.name.upper()}_PATH"):
            local_path = Path(os.environ[f"UA_EDT_{dest.name.upper()}_PATH"])
            if local_path.exists():
                logger.info(f"Using local override for {dest.name}: {local_path}")
                return True

        if dest.exists():
            if expected_md5 and self.verify_checksum(dest, expected_md5):
                logger.info(f"File {dest.name} already exists and checksum matches.")
                return True
            elif not expected_md5:
                logger.info(f"File {dest.name} already exists (skipping checksum).")
                return True

        headers = {}
        mode = "wb"
        initial_pos = 0
        
        if resume and dest.exists():
            initial_pos = dest.stat().st_size
            headers['Range'] = f'bytes={initial_pos}-'
            mode = "ab"

        try:
            response = requests.get(url, headers=headers, stream=True)
            response.raise_for_status()
            total_size = int(response.headers.get('content-length', 0)) + initial_pos

            with open(dest, mode) as f, tqdm(
                desc=dest.name,
                initial=initial_pos,
                total=total_size,
                unit='iB',
                unit_scale=True,
                unit_divisor=1024,
            ) as bar:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        size = f.write(chunk)
                        bar.update(size)
            
            if expected_md5 and not self.verify_checksum(dest, expected_md5):
                logger.error(f"Checksum mismatch for {dest.name}")
                return False
                
            return True
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            return False

    def get_dataset(self, name: str, version: str, urls: Dict[str, str], md5s: Dict[str, str] = None) -> Path:
        """
        Retrieves a dataset, validating versions and downloading if necessary.
        """
        dataset_path = self.cache_dir / name / version
        dataset_path.mkdir(parents=True, exist_ok=True)

        md5s = md5s or {}
        success = True
        
        for filename, url in urls.items():
            file_dest = dataset_path / filename
            expected_md5 = md5s.get(filename)
            
            if not self.download_file(url, file_dest, expected_md5):
                success = False

        if success:
            self.metadata[name] = {"version": version, "path": str(dataset_path)}
            self._save_metadata()
            
        return dataset_path
