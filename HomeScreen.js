import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'https://api.tvmaze.com/shows';

export default function HomeScreen({ navigation }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true; // evita atualizar estado após desmontar

    async function loadShows() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Erro HTTP ${response.status}`);
        }
        const data = await response.json();
        if (active) setShows(data);
      } catch (e) {
        if (active) setError('Não foi possível carregar as séries. ' + e.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadShows();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.hint}>Carregando séries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    // image pode ser null
    const uri = item.image?.medium ?? null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Detail', { id: item.id, name: item.name })
        }
      >
        {uri ? (
          <Image source={{ uri }} style={styles.poster} />
        ) : (
          <View style={[styles.poster, styles.noImage]}>
            <Text style={styles.noImageText}>Sem imagem</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={shows}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.hint}>Nenhuma série encontrada.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  hint: { marginTop: 10, color: '#666', textAlign: 'center' },
  error: { color: '#c0392b', fontSize: 16, textAlign: 'center' },
  list: { padding: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  poster: { width: 70, height: 100, borderRadius: 6 },
  noImage: { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  noImageText: { fontSize: 11, color: '#777', textAlign: 'center' },
  title: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600' },
});