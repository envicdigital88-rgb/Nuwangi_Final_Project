import trimesh
import os

input_path = r"C:\Users\User\Downloads\Final_Project-master\uploads\models\pant_fitted.obj"
output_path = r"C:\Users\User\Downloads\Final_Project-master\uploads\models\pant_fitted_optimized.glb"

print(f"Loading {input_path}...")
mesh = trimesh.load(input_path, force='mesh')

print("Optimizing mesh...")
# Apply some basic trimesh optimizations (merge vertices, remove duplicates, etc.)
mesh.process()

print(f"Exporting to {output_path}...")
mesh.export(output_path)

print("Done! The GLB file is ready and will load instantly.")
