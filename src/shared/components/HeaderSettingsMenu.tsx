import * as React from "react";
import { Modal, Pressable, Text, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Settings, LogOut, Sun, Moon, Smartphone } from "lucide-react-native";
import { useAuth } from "@/auth/hooks/use-auth";
import { useTheme, themeStorage, type ThemePreference } from "@/shared/hooks/useTheme";
import { AnimatedScaleFade } from "@/shared/components/AnimatedScaleFade";
import { hapticFeedback } from "@/shared/utils/haptics";
import { cn } from "@/shared/lib/utils";

export interface HeaderSettingsMenuProps {
  /** Classe extra aplicada ao wrapper do botão de engrenagem */
  className?: string;
  /** Identificador para testes automatizados */
  testID?: string;
}

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  Icon: typeof Sun;
}> = [
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Escuro", Icon: Moon },
  { value: "system", label: "Auto", Icon: Smartphone },
];

/**
 * Menu de configurações em formato popover acionado pelo ícone de engrenagem no header.
 * Oferece alternância de tema (Claro / Escuro / Automático) e ação de encerrar sessão.
 */
export function HeaderSettingsMenu({
  className,
  testID = "header-settings",
}: HeaderSettingsMenuProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const { user, logout } = useAuth();
  const { isDark, setTheme, toggleColorScheme } = useTheme();

  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTheme, setActiveTheme] = React.useState<ThemePreference>(isDark ? "dark" : "light");
  const [menuAnchor, setMenuAnchor] = React.useState<{ top: number; right: number } | null>(null);
  const triggerRef = React.useRef<React.ComponentRef<typeof View>>(null);

  React.useEffect(() => {
    let isMounted = true;
    void themeStorage.getPreference().then((saved) => {
      if (!isMounted) return;
      if (saved === "light" || saved === "dark" || saved === "system") {
        setActiveTheme(saved);
      } else {
        setActiveTheme(isDark ? "dark" : "light");
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen, isDark]);

  const handleOpen = () => {
    void hapticFeedback.selection();
    if (triggerRef.current && typeof triggerRef.current.measureInWindow === "function") {
      triggerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        if (height > 0) {
          setMenuAnchor({
            top: y + height + 8,
            right: Math.max(windowWidth - (x + width), 16),
          });
        }
      });
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectTheme = (mode: ThemePreference) => {
    void hapticFeedback.selection();
    setActiveTheme(mode);
    if (typeof setTheme === "function") {
      setTheme(mode);
      return;
    }
    toggleColorScheme?.();
  };

  const handleLogout = async () => {
    void hapticFeedback.impactLight();
    setIsOpen(false);
    await logout();
    router.replace("/(auth)/login");
  };

  const resolvedAnchor = menuAnchor ?? {
    top: Math.max(insets.top, 16) + 56,
    right: 24,
  };

  return (
    <View ref={triggerRef} collapsable={false} className={className}>
      <Pressable
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel="Abrir configurações"
        accessibilityState={{ expanded: isOpen }}
        testID={`${testID}-trigger`}
        className="h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted active:scale-95 active:opacity-70"
      >
        <Settings size={17} color={isDark ? "#FAFAFA" : "#52525B"} />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={handleClose}
        testID={`${testID}-modal`}
      >
        <View className="flex-1">
          <Pressable
            className="absolute inset-0 bg-black/15"
            onPress={handleClose}
            accessibilityLabel="Fechar configurações"
            testID={`${testID}-backdrop`}
          />

          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              top: resolvedAnchor.top,
              right: resolvedAnchor.right,
            }}
          >
            <AnimatedScaleFade
              initialScale={0.94}
              duration={150}
              className="w-72 rounded-2xl border border-border bg-card p-2 shadow-xl"
              style={{ borderCurve: "continuous" }}
            >
              {user ? (
                <View className="mb-1 border-b border-border/60 px-3.5 py-2.5">
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              ) : null}

              <View className="px-3 py-2.5">
                <Text className="mb-2 text-xs font-medium text-muted-foreground">
                  Tema do aplicativo
                </Text>
                <View className="flex-row gap-1.5 rounded-xl bg-muted p-1.5">
                  {THEME_OPTIONS.map(({ value, label, Icon }) => {
                    const isSelected = activeTheme === value;
                    const iconColor = isSelected
                      ? isDark
                        ? "#FAFAFA"
                        : "#09090B"
                      : isDark
                        ? "#A1A1AA"
                        : "#71717A";

                    return (
                      <Pressable
                        key={value}
                        onPress={() => handleSelectTheme(value)}
                        accessibilityRole="button"
                        accessibilityLabel={`Tema ${label}`}
                        accessibilityState={{ selected: isSelected }}
                        testID={`${testID}-theme-${value}`}
                        className={cn(
                          "flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 active:opacity-80",
                          isSelected ? "bg-card" : "bg-muted",
                        )}
                        style={
                          isSelected
                            ? {
                                shadowColor: "#000000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.08,
                                shadowRadius: 2,
                                elevation: 1,
                              }
                            : undefined
                        }
                      >
                        <Icon size={15} color={iconColor} />
                        <Text
                          className={cn(
                            "text-sm",
                            isSelected
                              ? "font-semibold text-foreground"
                              : "font-medium text-muted-foreground",
                          )}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="my-1 h-[1px] bg-border/60" />

              <Pressable
                onPress={handleLogout}
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
                testID={`${testID}-logout`}
                className="flex-row items-center gap-3 rounded-xl px-3.5 py-3 active:bg-destructive/10"
              >
                <LogOut size={18} color="#FF3B30" />
                <Text className="text-sm font-semibold text-destructive">Sair da conta</Text>
              </Pressable>
            </AnimatedScaleFade>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default HeaderSettingsMenu;
