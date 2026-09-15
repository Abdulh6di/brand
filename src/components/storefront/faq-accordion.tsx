"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Accordion.Root type="single" collapsible className="divide-y divide-line border-y border-line">
      {items.map((item, i) => (
        <Accordion.Item key={i} value={`item-${i}`}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between py-5 text-left">
              <span className="font-display text-lg">{item.question}</span>
              <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" strokeWidth={1.5} />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pb-5 text-sm leading-relaxed text-charcoal/75">{item.answer}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
