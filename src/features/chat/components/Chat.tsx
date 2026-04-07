"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Sparkle, Send } from "lucide-react";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/shared/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";
import useIsMobile from "@/hooks/useIsMobile";

export default function Chat() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });
  const isMobile = useIsMobile();

  const [input, setInput] = useState("");

  return (
    <>
      {isMobile ? (
        <Drawer>
          <DrawerTrigger
            asChild
            className="fixed right-8 bottom-8 z-10 rounded-full px-0! py-0!"
          >
            <Button className="animate-chat-vibration h-14 w-14 border border-black/20 bg-white text-black hover:bg-white">
              <Sparkle className="size-8" />
            </Button>
          </DrawerTrigger>
          <div className="animate-chat-ping fixed right-8 bottom-8 z-9 h-14 w-14 rounded-full bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700"></div>
          <DrawerContent className="min-h-dvh justify-between">
            <DrawerHeader>
              <DrawerTitle></DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <div className="flex grow flex-col gap-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${message.role !== "user" ? "self-end" : "rounded-full bg-neutral-100 px-4 py-2"} w-fit text-sm`}
                >
                  {/* {message.role === "user" ? "User: " : "AI: "} */}
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <span key={index}>{part.text}</span>
                    ) : null,
                  )}
                </div>
              ))}
            </div>

            {(status === "submitted" || status === "streaming") && (
              <div>
                {status === "submitted" && <Spinner />}
                <button type="button" onClick={() => stop()}>
                  Stop
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }}
            >
              <DrawerFooter>
                <Field className="max-w-full">
                  {/* <FieldLabel htmlFor="inline-end-input">Input</FieldLabel> */}
                  <InputGroup>
                    <InputGroupInput
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={status !== "ready"}
                      placeholder="Pregúntame lo que necesites..."
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="submit"
                        variant="ghost"
                        className="hover:bg-transparent"
                      >
                        <Send />
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet>
          <SheetTrigger
            asChild
            className="fixed right-8 bottom-8 z-10 rounded-full px-0! py-0!"
          >
            <Button className="animate-chat-vibration h-14 w-14 border border-black/20 bg-white text-black hover:bg-white">
              <Sparkle className="size-8" />
            </Button>
          </SheetTrigger>
          <div className="animate-chat-ping fixed right-8 bottom-8 z-9 h-14 w-14 rounded-full bg-conic/decreasing from-violet-700 via-lime-300 to-violet-700"></div>
          <SheetContent className="justify-between">
            <SheetHeader>
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>
            <div className="flex grow flex-col gap-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${message.role !== "user" ? "self-end" : "rounded-full bg-neutral-100 px-4 py-2"} w-fit text-sm`}
                >
                  {/* {message.role === "user" ? "User: " : "AI: "} */}
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <span key={index}>{part.text}</span>
                    ) : null,
                  )}
                </div>
              ))}
            </div>

            {(status === "submitted" || status === "streaming") && (
              <div>
                {status === "submitted" && <Spinner />}
                <button type="button" onClick={() => stop()}>
                  Stop
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (input.trim()) {
                  sendMessage({ text: input });
                  setInput("");
                }
              }}
            >
              <SheetFooter>
                <Field className="max-w-full">
                  {/* <FieldLabel htmlFor="inline-end-input">Input</FieldLabel> */}
                  <InputGroup>
                    <InputGroupInput
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={status !== "ready"}
                      placeholder="Pregúntame lo que necesites..."
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="submit"
                        variant="ghost"
                        className="hover:bg-transparent"
                      >
                        <Send />
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
