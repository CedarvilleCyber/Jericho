"use client";

import { ActionIcon, useMantineColorScheme, useComputedColorScheme, Box } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      <Box darkHidden>
        <IconSun size={20} />
      </Box>
      <Box lightHidden>
        <IconMoon size={20} />
      </Box>
    </ActionIcon>
  );
}
