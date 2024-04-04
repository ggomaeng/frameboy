import { PNG } from "pngjs";

export default class GBA {
  LOG_ERROR: number;
  LOG_WARN: number;
  LOG_STUB: number;
  LOG_INFO: number;
  LOG_DEBUG: number;
  SYS_ID: string;
  logLevel: number;
  rom: any; // Specific type can be added based on ROM structure
  cpu: ARMCore;
  canvas: MemoryCanvas;
  mmu: GameBoyAdvanceMMU;
  irq: GameBoyAdvanceInterruptHandler;
  io: GameBoyAdvanceIO;
  audio: GameBoyAdvanceAudio;
  video: GameBoyAdvanceVideo;
  keypad: GameBoyAdvanceKeypad;
  sio: GameBoyAdvanceSIO;
  paused: boolean;
  queue: any; // Should be the type of whatever setTimeout returns
  reportFPS: ((fps: number) => void) | null;
  throttle: number;
  seenFrame: boolean;
  seenSave: boolean;
  lastVblank: number;

  constructor();
  setCanvas(canvas: HTMLCanvasElement): void;
  setCanvasDirect(canvas: HTMLCanvasElement | MemoryCanvas): void;
  setCanvasMemory(): void;
  setBios(bios: Buffer, real?: boolean): void;
  setRom(rom: ArrayBuffer): boolean;
  hasRom(): boolean;
  loadRomFromFile(
    romFile: string,
    callback: (err: Error | null, result: boolean) => void
  ): void;
  reset(): void;
  step(stepCount?: number): void;
  waitFrame(): boolean;
  pause(): void;
  advanceFrame(): void;
  turbo(step?: number): void;
  runStable(): void;
  setSavedata(data: ArrayBuffer): void;
  loadSavedataFromFile(
    saveFile: string,
    callback: (err: Error | null) => void
  ): void;
  decodeSavedata(string: string): void;
  decodeBase64(string: string): ArrayBuffer;
  encodeBase64(view: DataView): string;
  downloadSavedataToFile(
    saveFile: string,
    callback: (err: Error | null) => void
  ): void;
  downloadSavedata(): void;
  storeSavedata(): void;
  retrieveSavedata(): boolean;
  screenshot(): PNG; // Assuming PNG is defined elsewhere
  freeze(): any; // Return type should detail the structure of the saved state
  defrost(frost: any): void;
  log(level: number, message: string): void;
  setLogger(logger: (level: number, message: string) => void): void;
  logStackTrace(stack: string[]): void;
  ERROR(error: string): void;
  WARN(warn: string): void;
  STUB(func: string): void;
  INFO(info: string): void;
  DEBUG(info: string): void;
  ASSERT_UNREACHED(err: string): void;
  ASSERT(test: boolean, err: string): void;
}

export class ARMCore {
  // Implementation details should be provided based on actual behavior
}

export class GameBoyAdvanceMMU {
  // Implementation details should be provided based on actual behavior
}

export class GameBoyAdvanceInterruptHandler {
  // Implementation details should be provided based on actual behavior
}

export class GameBoyAdvanceIO {
  // Implementation details should be provided based on actual behavior
}

export class GameBoyAdvanceAudio {
  // Implementation details should be provided based on actual behavior
}

export class GameBoyAdvanceVideo {
  // Implementation details should be provided based on actual behavior
}

export class GameBoyAdvanceKeypad {
  // Implementation details should be provided based on actual behavior
  press: (key: number) => void;
  A: number;
}

export class GameBoyAdvanceSIO {
  // Implementation details should be provided based on actual behavior
}

export class MemoryCanvas {
  pixelData: Uint8Array;
  // Assuming this is a custom class that acts like a canvas but in memory
}
