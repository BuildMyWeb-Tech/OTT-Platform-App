import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator, KeyboardAvoidingView, Platform,
    ScrollView, StatusBar, Text, TextInput,
    TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import api from "@/constants/api";

type SignUpMode = "password" | "email_otp";

export default function SignUp() {
    const router = useRouter();
    const { register } = useAuth();
    const { colors, isDark } = useTheme();

    const [mode, setMode] = useState<SignUpMode>("email_otp");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordSignUp = async () => {
        if (!name || !email || !password) {
            return Toast.show({ type: "error", text1: "Missing fields", text2: "Please fill in all fields" });
        }
        if (password.length < 6) {
            return Toast.show({ type: "error", text1: "Weak password", text2: "Password must be at least 6 characters" });
        }
        setLoading(true);
        const result = await register(name.trim(), email.trim().toLowerCase(), password);
        setLoading(false);
        if (result.success) {
            Toast.show({ type: "success", text1: "Account created!", text2: "Welcome to A2S Cinemas" });
            router.replace("/");
        } else {
            Toast.show({ type: "error", text1: "Registration failed", text2: result.message || "Something went wrong" });
        }
    };

    const handleSendOTP = async () => {
        if (!name.trim()) {
            return Toast.show({ type: "error", text1: "Name required", text2: "Enter your full name" });
        }
        if (!email.trim()) {
            return Toast.show({ type: "error", text1: "Email required", text2: "Enter your email address" });
        }
        setLoading(true);
        try {
            const { data } = await api.post("/auth/otp/send", {
                identifier: email.trim().toLowerCase(),
                type: "email",
                purpose: "register",
                name: name.trim(),
            });
            if (data.success) {
                Toast.show({ type: "success", text1: "OTP sent!", text2: data.message });
                router.push({
                    pathname: "/(auth)/otp-verify" as any,
                    params: {
                        identifier: email.trim().toLowerCase(),
                        type: "email",
                        purpose: "register",
                        name: name.trim(),
                    },
                });
            } else {
                Toast.show({ type: "error", text1: "Failed", text2: data.message });
            }
        } catch (e: any) {
            Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Failed to send OTP" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={24}
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 28 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Back button */}
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={{
                                position: "absolute", top: 12, left: 0, zIndex: 10,
                                width: 40, height: 40, borderRadius: 20,
                                backgroundColor: colors.surfaceVariant,
                                justifyContent: "center", alignItems: "center",
                            }}
                        >
                            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
                        </TouchableOpacity>

                        {/* Header */}
                        <View style={{ alignItems: "center", marginBottom: 32, marginTop: 20 }}>
                            <Text style={{ fontSize: 30, fontWeight: "800", color: colors.accent, marginBottom: 6 }}>
                                🎬 A2S Cinemas
                            </Text>
                            <Text style={{ fontSize: 26, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 }}>
                                Create Account
                            </Text>
                            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                                Sign up to start watching
                            </Text>
                        </View>

                        {/* Mode tabs — Password and Email OTP only */}
                        <View style={{
                            flexDirection: "row", backgroundColor: colors.surfaceVariant,
                            borderRadius: 12, padding: 4, marginBottom: 24, gap: 4,
                        }}>
                            <TouchableOpacity
                                onPress={() => setMode("email_otp")}
                                style={{
                                    flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center",
                                    backgroundColor: mode === "email_otp" ? colors.background : "transparent",
                                }}
                            >
                                <Text style={{
                                    fontSize: 13, fontWeight: "600",
                                    color: mode === "email_otp" ? colors.textPrimary : colors.textMuted,
                                }}>
                                    Email OTP
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setMode("password")}
                                style={{
                                    flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: "center",
                                    backgroundColor: mode === "password" ? colors.background : "transparent",
                                }}
                            >
                                <Text style={{
                                    fontSize: 13, fontWeight: "600",
                                    color: mode === "password" ? colors.textPrimary : colors.textMuted,
                                }}>
                                    Password
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Full Name — always shown */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{
                                fontSize: 13, fontWeight: "600",
                                color: colors.textSecondary, marginBottom: 8,
                            }}>
                                Full Name
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: colors.inputBg,
                                    borderWidth: 1, borderColor: colors.inputBorder,
                                    borderRadius: 14, padding: 16,
                                    fontSize: 15, color: colors.inputText,
                                }}
                                placeholder="Ajai Kumar"
                                placeholderTextColor={colors.inputPlaceholder}
                                value={name}
                                onChangeText={setName}
                                returnKeyType="next"
                            />
                        </View>

                        {/* Email — always shown */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{
                                fontSize: 13, fontWeight: "600",
                                color: colors.textSecondary, marginBottom: 8,
                            }}>
                                Email Address
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: colors.inputBg,
                                    borderWidth: 1, borderColor: colors.inputBorder,
                                    borderRadius: 14, padding: 16,
                                    fontSize: 15, color: colors.inputText,
                                }}
                                placeholder="user@example.com"
                                placeholderTextColor={colors.inputPlaceholder}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                returnKeyType="next"
                            />
                        </View>

                        {/* ── EMAIL OTP MODE ── */}
                        {mode === "email_otp" && (
                            <TouchableOpacity
                                onPress={handleSendOTP}
                                disabled={loading || !email.trim() || !name.trim()}
                                style={{
                                    backgroundColor: loading || !email.trim() || !name.trim()
                                        ? colors.surfaceVariant
                                        : colors.accent,
                                    borderRadius: 14, paddingVertical: 17,
                                    alignItems: "center", marginBottom: 20,
                                    flexDirection: "row", justifyContent: "center", gap: 8,
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons
                                            name="mail-outline"
                                            size={18}
                                            color={!email.trim() || !name.trim() ? colors.textMuted : "#fff"}
                                        />
                                        <Text style={{
                                            color: !email.trim() || !name.trim() ? colors.textMuted : "#fff",
                                            fontWeight: "700", fontSize: 16,
                                        }}>
                                            Send OTP to Email
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* ── PASSWORD MODE ── */}
                        {mode === "password" && (
                            <>
                                <View style={{ marginBottom: 24 }}>
                                    <Text style={{
                                        fontSize: 13, fontWeight: "600",
                                        color: colors.textSecondary, marginBottom: 8,
                                    }}>
                                        Password
                                    </Text>
                                    <View style={{
                                        flexDirection: "row", alignItems: "center",
                                        backgroundColor: colors.inputBg,
                                        borderWidth: 1, borderColor: colors.inputBorder,
                                        borderRadius: 14, paddingHorizontal: 16, paddingVertical: 4,
                                    }}>
                                        <TextInput
                                            style={{
                                                flex: 1, fontSize: 15,
                                                color: colors.inputText, paddingVertical: 12,
                                            }}
                                            placeholder="Min. 6 characters"
                                            placeholderTextColor={colors.inputPlaceholder}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={setPassword}
                                            returnKeyType="go"
                                            onSubmitEditing={handlePasswordSignUp}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={{ padding: 4 }}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={22}
                                                color={colors.textMuted}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: colors.accent,
                                        borderRadius: 14, paddingVertical: 17,
                                        alignItems: "center", marginBottom: 20,
                                        opacity: loading ? 0.7 : 1,
                                    }}
                                    onPress={handlePasswordSignUp}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                                            Create Account
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Sign in link */}
                        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4 }}>
                            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                                Already have an account?
                            </Text>
                            <Link href="/sign-in">
                                <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 14 }}>
                                    Login
                                </Text>
                            </Link>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}