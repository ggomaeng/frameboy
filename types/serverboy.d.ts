// ServerBoy Declaration File

// Assuming the API documentation details were like those typically found for an emulator library,
// this .d.ts file will provide basic structure and type definitions.

interface GameBoyOptions {
  gameFile: Buffer; // Placeholder for the actual type of the game file
}

interface ButtonPressOptions {
  buttonName: "A" | "B" | "start" | "select" | "right" | "left" | "up" | "down";
  duration?: number; // Duration in milliseconds for how long the button should be pressed
}

export default class ServerBoy {
  /**
   * Constructs a new Gameboy instance. Does not require any parameters.
   */
  constructor();

  /**
   * Loads a ROM into the Gameboy instance. ROMs are passed in as Node.js Buffers.
   * @param rom The ROM file data as a Buffer.
   */
  loadRom(rom: Buffer): void;

  /**
   * Advances the Gameboy instance by one frame. This is the only way to move the emulator forward.
   */
  doFrame(): void;

  /**
   * Presses a single key. Keys are automatically released at the end of each frame.
   * @param key The key to press, based on the KEYMAP enum.
   */
  pressKey(key: keyof typeof ServerBoy.KEYMAP): void;

  /**
   * Presses multiple keys. Keys are automatically released at the end of each frame.
   * @param keys An array of keys to press, based on the KEYMAP enum.
   */
  pressKeys(keys: (keyof typeof ServerBoy.KEYMAP)[]): void;

  /**
   * Returns an array containing the entire Gameboy memory contents, divided into roughly 64,000 256-bit chunks.
   */
  getMemory(): number[];

  /**
   * Returns raw PCM audio data in an array. This feature is still a work in progress.
   */
  getAudio(): number[];

  /**
   * Returns an array of pixel data, with 4 RGBA chunks for each pixel.
   */
  getScreen(): number[];

  pause(): void;

  /**
   * Returns save state
   */
  save(): any[];

  /**
   * Loads save state
   */
  load(ROM: Buffer, state: any): void;

  /**
   * An enumeration of available keys that can be pressed on the Gameboy.
   */
  static KEYMAP: {
    RIGHT: "RIGHT";
    LEFT: "LEFT";
    UP: "UP";
    DOWN: "DOWN";
    A: "A";
    B: "B";
    SELECT: "SELECT";
    START: "START";
  };
}
