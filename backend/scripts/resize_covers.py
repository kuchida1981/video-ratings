import os
import tempfile
from PIL import Image

def resize_covers(directory="uploads/covers/", max_width=1200, quality=85):
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return

    count = 0
    resized_count = 0

    for root, _, files in os.walk(directory):
        for filename in files:
            if filename.lower().endswith((".jpg", ".jpeg")):
                count += 1
                filepath = os.path.join(root, filename)
                try:
                    with Image.open(filepath) as img:
                        width, height = img.size
                        if width > max_width:
                            new_height = int(height * (max_width / width))

                            # Convert RGBA/P to RGB to avoid issues when saving as JPEG
                            if img.mode in ("RGBA", "P"):
                                img = img.convert("RGB")

                            resized_img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

                            # Save to a temporary file first for safety
                            fd, temp_path = tempfile.mkstemp(dir=root, suffix=".tmp")
                            try:
                                with os.fdopen(fd, 'wb') as tmp:
                                    resized_img.save(tmp, "JPEG", quality=quality)
                                os.replace(temp_path, filepath)
                                print(f"Resized: {os.path.relpath(filepath, directory)} ({width}x{height} -> {max_width}x{new_height})")
                                resized_count += 1
                            except Exception as e:
                                os.remove(temp_path)
                                raise e
                except Exception as e:
                    print(f"Error processing {filename}: {e}")


    print(f"\nSummary:")
    print(f"Total images found: {count}")
    print(f"Images resized: {resized_count}")

if __name__ == "__main__":
    # When running via docker compose exec backend python scripts/resize_covers.py
    # the CWD is usually /app, and uploads is at /app/uploads
    # But let's check if we should use relative path from the script location or absolute path
    # Usually it's better to use path relative to the project root
    resize_covers()
