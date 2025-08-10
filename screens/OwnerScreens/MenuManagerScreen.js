// success/screens/OwnerScreens/MenuManagerScreen.js
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  memo,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';

const API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://192.168.0.5:4000';

/* ─────────────────────────── AddForm (memoised) ───────────────────────── */
const AddForm = memo(
  ({
    name,
    setName,
    price,
    setPrice,
    description,
    setDescription,
    category,
    setCategory,
    photo,
    pickImage,
    busy,
    handleAdd,
  }) => (
    <ScrollView contentContainerStyle={styles.form} scrollEnabled={false}>
      <Text style={styles.heading}>Add Menu Item</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Description (optional)"
        placeholderTextColor="#999"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* category picker */}
      <View style={styles.pickRow}>
        {['Food', 'Drinks'].map(opt => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.catBtn,
              category === opt && styles.catBtnActive,
            ]}
            onPress={() => setCategory(opt)}
          >
            <Text
              style={[
                styles.catTxt,
                category === opt && styles.catTxtActive,
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* photo row */}
      <View style={styles.photoRow}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Feather name="image" size={28} color="#ccc" />
          </View>
        )}
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          <Feather name="upload" size={18} color="#fff" />
          <Text style={styles.photoBtnText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* submit */}
      <LinearGradient colors={['#34D399', '#059669']} style={styles.gradientBtn}>
        <TouchableOpacity
          onPress={handleAdd}
          style={[styles.btnInner, busy && { opacity: 0.6 }]}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.btnText}>{busy ? 'Adding…' : 'Add Item'}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  )
);

/* ─────────────────────────── Screen ─────────────────────────── */
export default function MenuManagerScreen() {
  const navigation     = useNavigation();
  const { restaurantId } = useRoute().params || {};
  const parentNav      = navigation.getParent();

  /* redirect if no ID */
  useEffect(() => {
    if (!restaurantId) {
      Alert.alert('Error', 'No restaurant selected');
      navigation.replace('OwnerHome');
    }
  }, [restaurantId]);

  /* header */
  useLayoutEffect(() => {
    parentNav?.setOptions({
      headerShown: true,
      title: 'Manage Menu',
      headerStyle: { backgroundColor: '#fafafa', elevation: 0 },
      headerTitleStyle: { color: '#333', fontSize: 18, fontWeight: '600' },
      headerLeft: () => (
        <TouchableOpacity onPress={() => parentNav.goBack()} style={{ marginLeft: 12 }}>
          <LinearGradient
            colors={['#34D399', '#059669']}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      ),
    });
  }, [parentNav]);

  /* state */
  const [meals, setMeals]         = useState([]);
  const [name, setName]           = useState('');
  const [price, setPrice]         = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]   = useState('Food');
  const [photo, setPhoto]         = useState(null);
  const [busy, setBusy]           = useState(false);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  /* fetch meals */
  const loadMeals = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE}/api/menu/restaurants/${restaurantId}/meals`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      const items = data.flatMap(section =>
        section.items.map(item => ({
          ...item,
          section: section.title,
          price  : item.price != null ? Number(item.price) : null,
        }))
      );
      setMeals(items);
    } catch (err) {
      console.error('Menu fetch error:', err.message);
      Alert.alert('Error', 'Could not load menu');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useFocusEffect(
    useCallback(() => { loadMeals(); }, [loadMeals])
  );

  /* group & filter */
  const sections = React.useMemo(() => {
    const groups = {};
    meals.forEach(item => {
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return;
      (groups[item.section || 'Main'] ??= []).push(item);
    });
    return Object.entries(groups)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [meals, search]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  /* helpers */
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  const handleAdd = async () => {
    if (!name.trim() || !price.trim()) {
      return Alert.alert('Validation', 'Name & price required');
    }
    const val = Number(price);
    if (isNaN(val)) {
      return Alert.alert('Validation', 'Price must be a number');
    }
    try {
      setBusy(true);
      await axios.post(
        `${API_BASE}/api/menu/restaurants/${restaurantId}/meals`,
        {
          name,
          price: val,
          photo: photo || '',
          description,
          section: category,
        }
      );
      /* clear form */
      setName('');
      setPrice('');
      setDescription('');
      setPhoto(null);
      loadMeals();
    } catch {
      Alert.alert('Error', 'Could not add item');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = id => {
    Alert.alert('Delete?', 'This action cannot be undone.', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE}/api/menu/meals/${id}`);
            setMeals(prev => prev.filter(m => m.id !== id));
          } catch {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  /* card renderer */
  const MealCard = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate('EditItemModal', { ...item })}
      android_ripple={{ color: '#eee' }}
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
    >
      <Image
        source={
          item.photo
            ? { uri: item.photo }
            : require('../../assets/icons/la-casa-logo.jpg')
        }
        style={styles.cardImg}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardPrice}>
          TMT {item.price != null ? item.price.toFixed(2) : '—'}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.cardAction}>
        <Feather name="trash" size={20} color="#ef4444" />
      </TouchableOpacity>
    </Pressable>
  );

  /* render */
  return (
    <SectionList
      sections={sections}
      keyExtractor={item => String(item.id)}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
      )}
      renderItem={({ item }) => <MealCard item={item} />}
      ListHeaderComponent={
        <AddForm
          name={name}
          setName={setName}
          price={price}
          setPrice={setPrice}
          description={description}
          setDescription={setDescription}
          category={category}
          setCategory={setCategory}
          photo={photo}
          pickImage={pickImage}
          busy={busy}
          handleAdd={handleAdd}
        />
      }
      contentContainerStyle={{ paddingBottom: 120 }}
    />
  );
}

/* ─────────────────────────── styles ────────────────────────── */
const styles = StyleSheet.create({
  /* screens */
  loader:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#fafafa' },

  /* form */
  form:{ padding:16, backgroundColor:'#fff', marginBottom:8 },
  heading:{ fontSize:20, fontWeight:'700', marginBottom:16, color:'#111' },
  input:{ backgroundColor:'#f3f4f6', borderRadius:8, paddingHorizontal:12, paddingVertical:10,
          fontSize:14, marginBottom:10, color:'#333' },

  pickRow:{ flexDirection:'row', marginBottom:12 },
  catBtn :{ flex:1, padding:8, marginHorizontal:4, borderRadius:6,
            backgroundColor:'#e5e7eb', alignItems:'center' },
  catBtnActive:{ backgroundColor:'#10b981' },
  catTxt :{ fontSize:13, color:'#374151' },
  catTxtActive:{ color:'#fff', fontWeight:'600' },

  photoRow:{ flexDirection:'row', alignItems:'center', marginBottom:14 },
  photoPlaceholder:{ width:80, height:60, borderRadius:8, backgroundColor:'#e5e7eb',
                     justifyContent:'center', alignItems:'center', marginRight:12 },
  photoPreview:{ width:80, height:60, borderRadius:8, marginRight:12 },
  photoBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#10b981',
             padding:10, borderRadius:8 },
  photoBtnText:{ color:'#fff', fontWeight:'600', marginLeft:6 },

  gradientBtn:{ borderRadius:8, overflow:'hidden', marginTop:8 },
  btnInner:{ flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:12 },
  btnText:{ color:'#fff', fontWeight:'600', marginLeft:6 },

  /* list */
  sectionHeader:{ backgroundColor:'#fafafa', paddingVertical:8, paddingHorizontal:16,
                  fontSize:16, fontWeight:'600', color:'#555' },

  card:{ flexDirection:'row', alignItems:'center', backgroundColor:'#fff',
         marginHorizontal:16, marginVertical:6, borderRadius:12, padding:12, elevation:1 },
  cardImg:{ width:60, height:60, borderRadius:8, marginRight:12 },
  cardBody:{ flex:1 },
  cardTitle:{ fontSize:15, fontWeight:'600', color:'#111' },
  cardPrice:{ marginTop:4, color:'#4b5563' },
  cardAction:{ padding:8 },
});
