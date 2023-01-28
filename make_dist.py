import json
import pathlib
import shutil
import subprocess

cd = pathlib.Path(__file__).parent.absolute()
manifest_json = cd / 'manifest.json'

source_folder = cd / 'source'
build_folder = cd / 'build'
dist_folder = cd / 'dist'

with open(manifest_json) as file:
    data = ''.join(
        line for line in file
        if not line.strip().startswith('//')
    )

    manifest_data = json.loads(data)

version = manifest_data['version']
project_name = '-'.join(manifest_data['name'].split()).lower()
dist_extension_folder = dist_folder / project_name

for pem_file in dist_folder.glob('*.pem'):
    break
else:
    pem_file = None

for extension in ('crx', 'zip'):
    for file in dist_folder.glob(f'*.{extension}'):
        file.unlink()

shutil.rmtree(build_folder, ignore_errors=True)
shutil.rmtree(dist_extension_folder, ignore_errors=True)

subprocess.run(['npx', 'tsc'], shell=True, cwd=cd)

for item in (
    source_folder,
    build_folder,
    manifest_json
):
    if item.is_dir():
        shutil.copytree(item, dist_extension_folder / item.name)
    else:
        shutil.copy(item, dist_extension_folder / item.name)

subprocess.run(
    [
        'chrome', 
        f'--pack-extension={dist_extension_folder}',
        f'--pack-extension-key={pem_file}' if pem_file else '',
    ],

    shell=True,
    cwd=cd
)

shutil.make_archive(
    dist_folder / project_name, 
    'zip', 
    dist_extension_folder,
)

for extension in ('crx', 'zip'):
    for file in dist_folder.glob(f'*.{extension}'):
        file.rename(file.parent / f'{file.stem}_{version}.{extension}')
