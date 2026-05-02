interface SplitTextResult {
  words: HTMLElement[];
  chars: HTMLElement[];
  revert: () => void;
}

const createSpan = (className: string) => {
  const span = document.createElement("span");
  span.className = className;
  span.setAttribute("aria-hidden", "true");
  return span;
};

export const splitText = (element: HTMLElement, splitChars = true): SplitTextResult => {
  const originalText = element.textContent ?? "";
  const words: HTMLElement[] = [];
  const chars: HTMLElement[] = [];

  element.setAttribute("aria-label", originalText.trim());
  element.textContent = "";

  originalText.split(/(\s+)/).forEach((part) => {
    if (!part) {
      return;
    }

    if (/^\s+$/.test(part)) {
      element.append(document.createTextNode(part));
      return;
    }

    const word = createSpan("split-word");
    words.push(word);

    if (splitChars) {
      [...part].forEach((char) => {
        const charSpan = createSpan("split-char");
        charSpan.textContent = char;
        chars.push(charSpan);
        word.append(charSpan);
      });
    } else {
      word.textContent = part;
    }

    element.append(word);
  });

  return {
    words,
    chars,
    revert: () => {
      element.textContent = originalText;
      element.removeAttribute("aria-label");
    },
  };
};
