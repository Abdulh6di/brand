"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIZE_CHART = [
  { size: "XS", bust: '32"', waist: '25"', hips: '35"' },
  { size: "S", bust: '34"', waist: '27"', hips: '37"' },
  { size: "M", bust: '36"', waist: '29"', hips: '39"' },
  { size: "L", bust: '38"', waist: '31"', hips: '41"' },
  { size: "XL", bust: '40"', waist: '33"', hips: '43"' },
];

export function SizeGuideDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="link" type="button" className="p-0">
          Need help choosing your size?
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-warm-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="font-display text-2xl">Size Guide</Dialog.Title>
            <Dialog.Close aria-label="Close">
              <X className="h-5 w-5" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-6 text-sm text-charcoal/75">
            Measurements in inches. For a fully custom fit, choose &ldquo;Custom&rdquo; at
            checkout and our team will contact you for measurements.
          </Dialog.Description>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left kicker">
                <th className="py-2">Size</th>
                <th className="py-2">Bust</th>
                <th className="py-2">Waist</th>
                <th className="py-2">Hips</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="border-b border-line/60">
                  <td className="py-2.5 font-medium">{row.size}</td>
                  <td className="py-2.5">{row.bust}</td>
                  <td className="py-2.5">{row.waist}</td>
                  <td className="py-2.5">{row.hips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
