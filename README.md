# React Native Story Viewer

Instagram benzeri, yüksek performanslı ve tamamen özelleştirilebilir bir React Native Story (Hikaye) bileşeni. Hem hazır bir UI (`<StoryViewer />`) sunar, hem de kendi arayüzünüzü yapabilmeniz için headless hook (`useStoryViewer`) sağlar.

## 🚀 Özellikler

- **Video ve Görsel Desteği:** `expo-video` ve `expo-image` kullanarak donanımsal hızlandırmalı, pürüzsüz medya oynatımı.
- **Gesture Destekli:** Sağa/sola dokunarak geçiş yapma, basılı tutarak duraklatma (pause), aşağı kaydırarak (swipe down) kapatma desteği.
- **Gömülü API İstemcisi:** Story'leri listeleme ve "görüldü" (seen) eventlerini toplu halde (batch) backend'e senkronize etme yeteneği.
- **Headless Architecture:** Kendi tasarımınızı mı uygulamak istiyorsunuz? UI bileşenlerini kullanmadan sadece `useStoryViewer` hook'u ile tüm mantığı kontrol edebilirsiniz.
- **Tip Güvenliği:** Uçtan uca %100 TypeScript.

---

## 📦 Kurulum

Bu kütüphane bazı React Native ve Expo paketlerine **peerDependency** olarak ihtiyaç duyar. Eğer projenizde yüklü değillerse, öncelikle onları kurmalısınız.

```bash
# Gerekli bağımlılıkları kurun
npx expo install expo-video expo-image react-native-gesture-handler react-native-reanimated @expo/vector-icons
```

Ardından kütüphaneyi projenize dahil edin:

```bash
# Eğer npm'de yayınlandıysa:
npm install @mertakdag/react-native-story-viewer
# veya yarn ile:
yarn add @mertakdag/react-native-story-viewer
```

*(Not: `react-native-gesture-handler` ve `react-native-reanimated` kurulum adımlarını tamamladığınızdan emin olun, örn: babel plugin ayarları vs.)*

---

## 🛠️ Temel Kullanım (Quick Start)

En hızlı entegrasyon yöntemi, paketle gelen hazır `<StoryViewer />` bileşenini kullanmaktır. 

```tsx
import React, { useState } from 'react';
import { View, Button } from 'react-native';
import { StoryViewer, StoryGroupDto } from '@mertakdag/react-native-story-viewer';

// Backend'den geldiği varsayılan örnek data
const DUMMY_STORY_GROUPS: StoryGroupDto[] = [
  // ... verileriniz
];

export default function App() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Hikayeleri Aç" onPress={() => setIsViewerOpen(true)} />

      <StoryViewer
        isVisible={isViewerOpen}
        groups={DUMMY_STORY_GROUPS}
        initialGroupIndex={0}
        onClose={() => setIsViewerOpen(false)}
        onCtaPress={(cta, story) => {
          console.log("CTA'ya Tıklandı:", cta.value);
        }}
      />
    </View>
  );
}
```

---

## 🌐 API Entegrasyonu (Görüldü İşaretleme)

Eğer kullanıcının hangi story'leri izlediğini backend'e senkronize etmek istiyorsanız, `<StoryViewer />` bileşenine bir `apiConfig` vermeniz yeterlidir. Sistem "görüldü" eventlerini arka planda **otomatik olarak** toplar ve belirtilen aralıklarla (batch halinde) sunucuya iletir.

```tsx
import { StoryViewer, StoryApiConfig } from '@mertakdag/react-native-story-viewer';

const myApiConfig: StoryApiConfig = {
  baseUrl: 'https://api.myapp.com/v1',
  getToken: async () => {
    // Kendi token alma mantığınız (örn: AsyncStorage, SecureStore)
    return await myAuthManager.getAccessToken();
  }
};

// Bileşende kullanımı:
<StoryViewer
  apiConfig={myApiConfig}
  isVisible={true}
  groups={groups}
  onClose={() => {}}
  config={{
    batchIntervalMs: 5000, // 5 saniyede bir kuyruktaki "görüldü"leri gönder
    batchQueueSize: 10,    // veya 10 event birikince hemen gönder
  }}
/>
```

---

## 🎨 İleri Düzey Kullanım (Headless Hook)

Standart arayüz projenizin tasarım diline uymuyorsa, `useStoryViewer` hook'unu kullanarak kendi özel arayüzünüzü (Custom UI) yaratabilirsiniz. Tüm geçiş, duraklatma ve API senkronizasyon mantığını hook sizin için yönetir.

```tsx
import { useStoryViewer } from '@mertakdag/react-native-story-viewer';
import { View, Text, TouchableOpacity } from 'react-native';

function MyCustomStoryViewer({ groups, isVisible, onClose }) {
  const {
    currentGroup,
    currentStory,
    currentIndex,
    isPaused,
    setIsPaused,
    handleNext,
    handlePrev,
    progress
  } = useStoryViewer({
    groups,
    isVisible,
    onClose,
  });

  if (!currentGroup || !currentStory) return null;

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Kendi özel medya gösterim bileşeniniz */}
      <MyVideoPlayer url={currentStory.mediaUrl} isPaused={isPaused} />
      
      {/* İleri / Geri butonları */}
      <TouchableOpacity onPress={handlePrev} style={styles.leftHalf} />
      <TouchableOpacity onPress={handleNext} style={styles.rightHalf} />
      
      {/* Basılı tutunca duraklatma */}
      <TouchableOpacity 
        onPressIn={() => setIsPaused(true)} 
        onPressOut={() => setIsPaused(false)} 
      />
    </View>
  );
}
```

---

## 📚 API Referansı

### `StoryViewerProps`

| Prop | Tip | Açıklama |
| --- | --- | --- |
| `groups` | `StoryGroupDto[]` | Gösterilecek hikaye grupları dizisi. (Zorunlu) |
| `isVisible` | `boolean` | Modal'ın açık olup olmadığını belirler. (Zorunlu) |
| `initialGroupIndex` | `number` | Hangi gruptan başlanacağı (Varsayılan: `0`). |
| `config` | `StoryViewerConfig` | UI ve Davranış ayarları (animasyon, batch süreleri vb.) |
| `apiConfig` | `StoryApiConfig` | Backend senkronizasyonu için Base URL ve Token fonksiyonu. |
| `onClose` | `() => void` | Kullanıcı çarpı butonuna bastığında veya swipe-down yaptığında tetiklenir. |
| `onCtaPress` | `(cta, story, group) => void` | Alt kısımdaki CTA butonuna basıldığında tetiklenir. |
| `onComplete` | `() => void` | Tüm gruplardaki tüm hikayeler bittiğinde tetiklenir. |

### `StoryViewerConfig`

| Ayar | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `defaultDurationMs` | `number` | `5000` | Story'nin data içinde süresi yoksa kullanılacak varsayılan süre. |
| `dismissThreshold` | `number` | `150` | Swipe-down ile kapatmak için kaydırılması gereken piksel miktarı. |
| `batchIntervalMs` | `number` | `5000` | API görüldü isteklerini topluca gönderme aralığı. |
| `batchQueueSize` | `number` | `10` | Bekleyen istek sayısı bu değere ulaşırsa süreyi beklemeden hemen gönderir. |
