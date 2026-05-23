const themeScript = `
(() => {
  const storageKey = "notes-theme";
  const savedTheme = window.localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme === "light" || savedTheme === "dark"
    ? savedTheme
    : prefersDark
      ? "dark"
      : "light";

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
})();
`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
