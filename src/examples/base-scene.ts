import type { DataTexture, PerspectiveCamera, Texture } from "three";
import {
  Clock,
  EquirectangularReflectionMapping,
  Mesh,
  MeshLambertMaterial,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export class BaseScene {
  public renderer: WebGLRenderer | null;
  public loadedTextures: Record<string, Texture>;
  private scene: Scene | null;
  private camera: PerspectiveCamera | null;
  private readonly originalCameraPosition: { x: number; y: number; z: number };
  private readonly originalCameraRotation: { x: number; y: number; z: number };
  private readonly loader: GLTFLoader;
  private readonly clock: Clock;

  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.originalCameraPosition = { x: 0, y: 0, z: 0 };
    this.originalCameraRotation = { x: 0, y: 0, z: 0 };
    this.loadedTextures = {};
    this.loader = new GLTFLoader();
    this.clock = new Clock();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    this.loader.setDRACOLoader(dracoLoader);
  }

  public async loadTextures(assetPaths: string[]): Promise<void> {
    const loader = new TextureLoader();

    try {
      const promises = assetPaths.map((path: string) => {
        return new Promise<Texture>((resolve, reject) => {
          loader.load(
            path,
            (texture: Texture) => {
              const fileName = path.split("/").pop()!.split(".")[0];
              this.loadedTextures[fileName] = texture;
              texture.colorSpace = SRGBColorSpace;
              resolve(texture);
            },
            undefined,
            (error: unknown) => {
              console.error(`Failed to load ${path}:`, error);
              reject(error);
            },
          );
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  }

  public async initScene() {
    this.scene = new Scene();

    await this.loadEnvironment();
    await this.loadTerrain();

    // Set environment as scene background
    {
      const texture = this.loadedTextures["T_Environment"];
      this.scene.background = texture;
      this.scene.environment = texture;
    }
  }

  public initRenderer() {
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    this.renderer.autoClear = false;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x111111, 1);
    document.body.appendChild(this.renderer.domElement);

    window.addEventListener("resize", () => this.onResize());
  }

  public updateCameraSway() {
    // Add subtle camera sway
    if (this.camera && this.originalCameraPosition) {
      const time = this.clock.getElapsedTime();
      const swayIntensity = 0.025;
      const swaySpeed = 0.8;

      // Subtle position sway
      this.camera.position.x =
        this.originalCameraPosition.x + Math.sin(time * swaySpeed) * swayIntensity;
      this.camera.position.y =
        this.originalCameraPosition.y + Math.cos(time * swaySpeed * 0.7) * swayIntensity * 0.5;

      // Subtle rotation sway
      this.camera.rotation.z =
        this.originalCameraRotation.z + Math.sin(time * swaySpeed * 0.8) * 0.005;
      this.camera.rotation.y =
        this.originalCameraRotation.y + Math.sin(time * swaySpeed * 0.8) * 0.01;
    }
  }

  public render(): void {
    if (this.scene && this.camera && this.renderer) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private async loadEnvironment(): Promise<DataTexture> {
    const rgbeLoader = new RGBELoader();

    return new Promise<DataTexture>((resolve, reject) => {
      rgbeLoader.load(
        "assets/T_Environment.hdr",
        (texture: DataTexture) => {
          texture.mapping = EquirectangularReflectionMapping;
          this.loadedTextures["T_Environment"] = texture;
          resolve(texture);
        },
        undefined,
        (error: unknown) => {
          console.error("Failed to load environment:", error);
          reject(error);
        },
      );
    });
  }

  private async loadTerrain() {
    return new Promise<void>((resolve) => {
      this.loader.setPath("assets/").load("SM_Terrain.glb", (gltf: GLTF) => {
        const model = gltf.scene;
        this.scene!.add(model);
        this.camera = gltf.cameras[0] as PerspectiveCamera;

        // Store original camera transform
        this.originalCameraPosition.x = this.camera.position.x;
        this.originalCameraPosition.y = this.camera.position.y;
        this.originalCameraPosition.z = this.camera.position.z;
        this.originalCameraRotation.x = this.camera.rotation.x;
        this.originalCameraRotation.y = this.camera.rotation.y;
        this.originalCameraRotation.z = this.camera.rotation.z;

        this.onResize();
        const terrain = model.getObjectByName("SM_Terrain");
        const material = new MeshLambertMaterial({ color: 0x00ff00 });
        if (terrain instanceof Mesh) {
          terrain.material = material;
        }

        resolve();
      });
    });
  }

  private onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }

    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }
}
