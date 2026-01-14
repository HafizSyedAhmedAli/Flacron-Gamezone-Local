import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, Pressable, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://localhost:4000";

export default function App() {
  const [live, setLive] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const res = await fetch(`${API_BASE}/api/matches/live`);
      const data = await res.json();
      setLive(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr("Failed to load");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 45000);
    return () => clearInterval(t);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 10 }}>
      <StatusBar style="auto" />
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: "600" }}>Flacron GameZone</Text>
        <Text style={{ marginTop: 4, opacity: 0.7 }}>Live matches (auto-refresh)</Text>

        {err ? <Text style={{ color: "red", marginTop: 10 }}>{err}</Text> : null}

        <View style={{ marginTop: 12 }}>
          <FlatList
            data={live}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ padding: 12, borderWidth: 1, borderRadius: 14, marginBottom: 10 }}>
                <Text style={{ opacity: 0.7 }}>{item.league?.name || "League"}</Text>
                <Text style={{ fontWeight: "600", marginTop: 3 }}>{item.homeTeam?.name} vs {item.awayTeam?.name}</Text>
                <Text style={{ marginTop: 4 }}>Score: {item.score || "0-0"} • {item.status}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No live matches.</Text>}
          />
        </View>

        <Pressable onPress={load} style={{ padding: 12, borderWidth: 1, borderRadius: 14, alignItems: "center" }}>
          <Text>Refresh</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
