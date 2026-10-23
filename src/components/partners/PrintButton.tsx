"use client";

import { buttonClass } from "../Button";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonClass("dark")}>
      Print or save as PDF
    </button>
  );
}
