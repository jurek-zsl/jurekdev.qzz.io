"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { SpotlightButton } from "./spotlight-button";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactModal({ open, onOpenChange }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("PROJECT INQUIRY");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("ERR: Missing required fields");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSubmitted(true);

    toast.success("OK: Message transmitted", {
      description: `Receiver: jurek@jurekdev.qzz.io · Sender: ${email}`,
    });

    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setMessage("");
      onOpenChange(false);
    }, 1800);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#000000]/80" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border border-[#e5e5e5] bg-[#000000] p-5 font-mono text-[#e5e5e5]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#38bdf8] font-bold">:::</span>
              <span className="font-bold uppercase text-[#38bdf8]">
                [TRANSMIT_MESSAGE_PROMPT]
              </span>
            </div>
            <Dialog.Close className="border border-[#e5e5e5] px-1.5 py-0.5 text-[11px] text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]">
              [X]
            </Dialog.Close>
          </div>

          {submitted ? (
            <div className="py-8 text-center text-xs space-y-2">
              <div className="text-[#38bdf8] font-bold">[STATUS: BUFFER_SENT_200_OK]</div>
              <p>Message delivered to jurek@jurekdev.qzz.io</p>
              <p className="text-[11px] text-[#38bdf8]">ACK received.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#38bdf8] mb-1">
                    SENDER_NAME:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full border border-[#e5e5e5] bg-[#000000] px-2.5 py-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#38bdf8] mb-1">
                    SENDER_EMAIL:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full border border-[#e5e5e5] bg-[#000000] px-2.5 py-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#38bdf8] mb-1">
                  TOPIC_TAG:
                </label>
                <div className="flex gap-2">
                  {["PROJECT INQUIRY", "CONSULTING", "HELLO"].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setType(item)}
                      className={`border px-2 py-1 text-[11px] cursor-pointer ${
                        type === item
                          ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                          : "border-[#e5e5e5] text-[#e5e5e5]"
                      }`}
                    >
                      [{item}]
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#38bdf8] mb-1">
                  BUFFER_CONTENT:
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Engineering requirements, architecture questions, timeline..."
                  className="w-full resize-none border border-[#e5e5e5] bg-[#000000] px-2.5 py-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#e5e5e5]">
                <span className="text-[10px] text-[#e5e5e5]">
                  DST: jurek@jurekdev.qzz.io
                </span>

                <SpotlightButton
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "TRANSMITTING..." : "SEND"}
                </SpotlightButton>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
