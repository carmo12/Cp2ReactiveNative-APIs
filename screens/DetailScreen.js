import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const SEM_SINOPSE = 'Sinopse não disponível.';

// summary vem com tags HTML (<p>, <b>...) e pode ser null
function cleanSummary(summary) {
  if (!summary) return '';
  return summary.replace(/<[^>]+>/g, '').trim();
}

// A API de tradução aceita ~500 caracteres por chamada, então dividimos por frases
function splitText(text, max = 450) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > max && current) {
      chunks.push(current.trim());
      current = '';
    }
    current += sentence;
    while (current.length > max) {
      chunks.push(current.slice(0, max).trim());
      current = current.slice(max);
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

async function translateToPt(text) {
  const parts = [];
  for (const chunk of splitText(text)) {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|pt-BR`
    );
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }
    const data = await response.json();
    if (Number(data.responseStatus) !== 200) {
      throw new Error('Limite de tradução atingido');
    }
    parts.push(data.responseData.translatedText);
  }
  return parts.join(' ');
}

export default function DetailScreen({ route }) {
  const { id, name } = route.params;

  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // episódio com sinopse aberta
  const [translations, setTranslations] = useState({}); // cache: { [id]: { text, translated } }
  const [translatingId, setTranslatingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadEpisodes() {
      try {
        const response = await fetch(
          `https://api.tvmaze.com/shows/${id}/episodes`
        );
        if (!response.ok) {
          throw new Error(`Erro HTTP ${response.status}`);
        }
        const data = await response.json();
        if (active) setEpisodes(data);
      } catch (e) {
        if (active) setError('Não foi possível carregar os episódios. ' + e.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEpisodes();
    return () => {
      active = false;
    };
  }, [id]);

  const toggleEpisode = async (episode) => {
    // fecha se já estiver aberto
    if (expandedId === episode.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(episode.id);

    // já traduzido antes: usa o cache
    if (translations[episode.id]) return;

    const original = cleanSummary(episode.summary);
    if (!original) {
      setTranslations((prev) => ({
        ...prev,
        [episode.id]: { text: SEM_SINOPSE, translated: true },
      }));
      return;
    }

    setTranslatingId(episode.id);
    try {
      const translated = await translateToPt(original);
      setTranslations((prev) => ({
        ...prev,
        [episode.id]: { text: translated, translated: true },
      }));
    } catch (e) {
      // se a tradução falhar, mostra o texto original em inglês
      setTranslations((prev) => ({
        ...prev,
        [episode.id]: { text: original, translated: false },
      }));
    } finally {
      setTranslatingId(null);
    }
  };

  const header = <Text style={styles.header}>{name}</Text>;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.hint}>Carregando episódios...</Text>
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

  return (
    <FlatList
      data={episodes}
      keyExtractor={(item) => String(item.id)}
      extraData={{ expandedId, translations, translatingId }}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <Text style={styles.hint}>Nenhum episódio encontrado.</Text>
      }
      renderItem={({ item }) => {
        const isOpen = expandedId === item.id;
        const isTranslating = translatingId === item.id;
        const result = translations[item.id];

        return (
          <Pressable style={styles.episode} onPress={() => toggleEpisode(item)}>
            <Text style={styles.epInfo}>
              Temporada {item.season} • Episódio {item.number ?? 'Especial'}
            </Text>
            <Text style={styles.epName}>{item.name}</Text>

            {isOpen && isTranslating && (
              <View style={styles.translating}>
                <ActivityIndicator size="small" />
                <Text style={styles.translatingText}>Traduzindo sinopse...</Text>
              </View>
            )}

            {isOpen && !isTranslating && result && (
              <>
                <Text style={styles.summary}>{result.text}</Text>
                {!result.translated && (
                  <Text style={styles.warning}>
                    Tradução indisponível no momento. Exibindo o texto original em inglês.
                  </Text>
                )}
              </>
            )}

            <Text style={styles.toggleHint}>
              {isOpen ? 'Toque para fechar' : 'Toque para ver a sinopse'}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  hint: { marginTop: 10, color: '#666', textAlign: 'center' },
  error: { color: '#c0392b', fontSize: 16, textAlign: 'center' },
  list: { padding: 12 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  episode: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  epInfo: { fontSize: 12, color: '#888', marginBottom: 4 },
  epName: { fontSize: 16, fontWeight: '500' },
  summary: { marginTop: 8, fontSize: 14, color: '#333', lineHeight: 20 },
  translating: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  translatingText: { marginLeft: 8, fontSize: 13, color: '#666' },
  warning: { marginTop: 6, fontSize: 11, color: '#c0392b' },
  toggleHint: { marginTop: 8, fontSize: 11, color: '#999' },
});
