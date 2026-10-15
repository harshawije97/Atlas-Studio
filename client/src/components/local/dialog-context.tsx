/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { JSXElementConstructor, ReactElement } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
  ComponentRenderFn,
  DialogTriggerState,
  HTMLProps,
} from "@base-ui/react";

interface DialogContextProps {
  children: React.ReactNode;
  renderContent?:
    | ReactElement<unknown, string | JSXElementConstructor<any>>
    | ComponentRenderFn<HTMLProps, DialogTriggerState>
    | undefined;
  label?: string;
  title?: string;
}

function DialogContext({
  children,
  renderContent,
  ...props
}: DialogContextProps) {
  return (
    <>
      <Dialog>
        <DialogTrigger render={renderContent} />
        <DialogContent>{children}</DialogContent>
      </Dialog>
    </>
  );
}

export default DialogContext;
