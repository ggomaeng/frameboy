/** @jsxImportSource frog/jsx */
import { Button } from 'frog';

export default {
  image: (
    <div tw="flex h-full w-full flex-col items-center justify-center bg-black text-lg text-white">
      <div tw="text-4xl">🎮</div>
      <div tw="mt-5 text-4xl font-bold">FrameBoy Guidebook</div>
      <div tw="mt-10 flex">
        Type <span tw="mx-2 text-yellow-300">ANY TEXT</span> in the inputbox to
        toggle controls between
      </div>
      <div
        tw="mt-5 flex items-center justify-start text-lg"
        style={{ gap: 10 }}
      >
        <div tw="flex h-10 w-10 items-center justify-center rounded-full bg-[#492C98] p-1 text-black">
          1
        </div>
        <div tw="flex h-10 min-w-10 items-center justify-center border-2 border-[#492C98] p-1">
          ←
        </div>
        <div tw="flex h-10 min-w-10 items-center justify-center border-2 border-[#492C98] p-1">
          →
        </div>
        <div tw="flex h-10 min-w-10 items-center justify-center border-2 border-[#492C98] p-1">
          ↑
        </div>
        <div tw="flex h-10 min-w-10 items-center justify-center border-2 border-[#492C98] p-1">
          ↓
        </div>
      </div>

      <div
        tw="mt-5 flex items-center justify-start text-lg"
        style={{ gap: 10 }}
      >
        <div tw="flex h-10 w-10 items-center justify-center rounded-full bg-[#492C98] p-1 text-black">
          2
        </div>
        <div tw="flex h-10 min-w-10 items-center justify-center border-2 border-[#492C98] p-1">
          SEL
        </div>
        <div tw="flex h-10 min-w-10 items-center justify-center border-2 border-[#492C98] p-1">
          START
        </div>
        <div tw="flex h-10 min-w-10 items-center justify-center border-2 border-[#492C98] p-1">
          A
        </div>
        <div tw="flex h-10 min-w-10 items-center justify-center border-2 border-[#492C98] p-1">
          B
        </div>
      </div>

      <div tw="mt-20 flex">
        Type <span tw="mx-2 text-yellow-300">ANY NUMBER</span> in the inputbox
        to set keypress multiplier
      </div>

      <div tw="mt-5 flex flex-col items-center justify-center text-base text-gray-500">
        <div tw="flex">Example</div>
        <div tw="mt-2">2 would multiply your keypresses by two</div>
      </div>
    </div>
  ),
  intents: [<Button>Back</Button>],
};
