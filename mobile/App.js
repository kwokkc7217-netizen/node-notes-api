// mobile/App.js — Expo React Native client for node-notes-api
// 對應 Hutchison 技能：React Native、REST API 串接
// Backend: https://node-notes-api-3p1r.onrender.com （Express + Postgres）

import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const API_BASE = "https://node-notes-api-2he1.onrender.com";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true); // 第一次載入
  const [refreshing, setRefreshing] = useState(false); // 下拉 refresh
  const [hello, setHello] = useState(""); // /api/hello 狀態
  const [error, setError] = useState("");

  // ---- API calls ----
  async function loadNotes() {
    const res = await fetch(`${API_BASE}/api/notes`);
    if (!res.ok) throw new Error(`GET /api/notes -> ${res.status}`);
    return res.json(); // [{ id, text, created_at }]
  }

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const [helloRes, noteList] = await Promise.all([
        fetch(`${API_BASE}/api/hello`).then((r) => r.json()),
        loadNotes(),
      ]);
      setHello(helloRes.message);
      setNotes(noteList);
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addNote() {
    const t = text.trim();
    if (!t) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t }),
      });
      if (!res.ok) throw new Error(`POST /api/notes -> ${res.status}`);
      const created = await res.json();
      setNotes((prev) => [created, ...prev]); // 新嘅放最前（同 API 嘅 DESC 一致）
      setText("");
    } catch (e) {
      setError(e.message);
    }
  }

  function confirmDelete(id) {
    Alert.alert("刪除", "確定刪除呢條 note？", [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: () => deleteNote(id),
      },
    ]);
  }

  async function deleteNote(id) {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE /api/notes/${id} -> ${res.status}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  // ---- UI ----
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.hint}>載入緊…（Render 免費版 cold start，第一次可能要等一陣）</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      {!!hello && <Text style={styles.hint}>{hello}</Text>}
      {!!error && <Text style={styles.error}>⚠ {error}</Text>}

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="新增一條 note…"
          value={text}
          onChangeText={setText}
          onSubmitEditing={addNote}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addNote}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={refresh}
        ListEmptyComponent={<Text style={styles.hint}>暫時冇 notes，上面加一條啦。</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.noteText}>{item.text}</Text>
            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Text style={styles.del}>刪除</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  hint: { color: "#888", fontSize: 13, marginBottom: 8 },
  error: { color: "#c00", marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 12 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: "#14532d",
    borderRadius: 8,
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: { color: "#fff", fontSize: 24, lineHeight: 28 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fafafa",
  },
  noteText: { flex: 1, fontSize: 16, marginRight: 8 },
  del: { color: "#c00", fontSize: 14 },
});
