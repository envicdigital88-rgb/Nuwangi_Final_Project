import trimesh
import os

files_to_convert = {
    "pant.obj": "real_pants.glb",
    "shirt.obj": "real_shirt.glb",
    "model-cmnoivjrn09p0u3mht6w5esfm.obj": "real_dress.glb",
    "suit.obj": "real_suit.glb"
}

base_path = r"C:\Users\User\Downloads\Final_Project-master\uploads\models"

for obj_name, glb_name in files_to_convert.items():
    obj_path = os.path.join(base_path, obj_name)
    glb_path = os.path.join(base_path, glb_name)
    
    if os.path.exists(obj_path):
        print(f"Converting {obj_name} to {glb_name}...")
        try:
            mesh = trimesh.load(obj_path, force='mesh')
            mesh.export(glb_path)
            print(f"Successfully created {glb_name}!")
        except Exception as e:
            print(f"Error converting {obj_name}: {e}")
    else:
        print(f"File not found: {obj_path}")

print("All real models converted to fast-loading GLBs!")
