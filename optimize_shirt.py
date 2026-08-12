import trimesh
import os

input_path = r"C:\Users\User\Downloads\Final_Project-master\uploads\models\shirt_fitted.obj"
output_path = r"C:\Users\User\Downloads\Final_Project-master\uploads\models\shirt_fitted_optimized.glb"

if not os.path.exists(input_path):
    print(f"Error: {input_path} not found.")
else:
    print(f"Loading {input_path}...")
    mesh = trimesh.load(input_path, force='mesh')

    print("Optimizing mesh...")
    mesh.process()

    print(f"Exporting to {output_path}...")
    mesh.export(output_path)

    print("Done! The GLB file is ready and will load instantly.")
