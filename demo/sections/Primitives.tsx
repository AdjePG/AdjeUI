import { Package, Search, Sparkles } from "lucide-react";
import { Avatar, AvatarStack, Card, CodeBlock, Empty, IconChip, Pill, Skeleton, palette } from "../../src";
import { Block, Frame, Section } from "../common";

// ---------------- primitives ----------------

export function PrimitivesSection() {
  return (
    <Section id="primitives" title="Primitives" subtitle="src/primitives — surfaces and basic pieces">
      <Card className="flex flex-col gap-4">
        <Block name="Card (glow) / IconChip (md, lg)">
          <Card className="!p-3 text-[13px]">A Card inside another</Card>
          <Card glow className="!p-3 text-[13px]">Card with glow</Card>
          <IconChip><Sparkles size={15} /></IconChip>
          <IconChip size="lg"><Package size={17} /></IconChip>
        </Block>
        <Block name="Pill (neutral / colored)">
          <Pill>Neutral</Pill>
          <Pill color={palette("green", 600)}>Published</Pill>
          <Pill color={palette("violet", 600)}>Designing</Pill>
          <Pill color={palette("red", 600)}>Paused</Pill>
          <Pill color="var(--accent-blue)"><Sparkles size={11} /> With icon</Pill>
        </Block>
        <Block name="Avatar: initials on the app gradient or a colour, image (broken → initials) × size (sm 24 · md 32 · lg 40 · xl 56) × shape · AvatarStack (+N)">
          <Avatar name="Ada Lovelace" size="sm" />
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" size="lg" color={palette("teal", 600)} />
          <Avatar name="Alan Turing" size="xl" shape="square" color={palette("violet", 600)} />
          <Avatar name="Broken image" src="/missing.png" />
          <AvatarStack
            items={["Ada Lovelace", "Grace Hopper", "Alan Turing", "Katherine Johnson", "Edsger Dijkstra", "Barbara Liskov"].map((name, i) => ({
              name,
              color: palette((["blue", "teal", "violet", "rose", "amber", "green"] as const)[i], 600),
            }))}
            max={4}
          />
        </Block>
        <Block name="Skeleton (className gives the shape)">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="w-9 h-9 rounded-full" />
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-16 w-full" />
        </Block>
        <Block name="Empty (with and without icon)">
          <Frame className="flex-1">
            <Empty icon={<Search />} title="No results">Try other filters.</Empty>
          </Frame>
          <Frame className="flex-1">
            <Empty title="Nothing here yet" />
          </Frame>
        </Block>
        <Block name="CodeBlock: the reader turns on color and line numbers; the horizontal bar IS VISIBLE">
          <div className="w-full max-w-lg">
            <CodeBlock
              language="js"
              code={[
                "// A variable is a name attached to a value",
                'const name = "Adrià";',
                'name = "Marc";   // TypeError: Assignment to constant variable',
                "",
                "function greet(who, times = 3) {",
                "  for (let i = 0; i < times; i++) console.log(`Hello, ${who}! This line is deliberately very long to check that the horizontal scrollbar exists and can be dragged`);",
                "}",
              ].join("\n")}
            />
          </div>
        </Block>
      </Card>
    </Section>
  );
}
