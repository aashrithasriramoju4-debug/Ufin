import os
import zipfile

def zip_folder(folder_path, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            # Exclude node_modules and .git
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if '.git' in dirs:
                dirs.remove('.git')
            if 'dist' in dirs:
                dirs.remove('dist')
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, os.path.dirname(folder_path))
                zipf.write(file_path, arcname)

base_dir = r"c:\Users\ASUS\OneDrive\Desktop\cbit\ufin_new"
zip_folder(os.path.join(base_dir, "client"), os.path.join(base_dir, "frontend.zip"))
zip_folder(os.path.join(base_dir, "server"), os.path.join(base_dir, "backend.zip"))

print("Successfully created frontend.zip and backend.zip")
