import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import {
  View, Text, TextInput, SectionList, Alert, StyleSheet, ActivityIndicator,
  Platform, StatusBar, SafeAreaView, TouchableOpacity
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { HeaderBackButton } from '@react-navigation/elements';
import axios from 'axios';

import AddMenuItemForm from '../../components/AddMenuItemForm';
import MealCard from '../../components/MealCard';
import OptionsModal from '../../components/modals/OptionsModal';

// API base for this screen
const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://172.17.0.48:4000';

export default function MenuManagerScreen() {
  const navigation       = useNavigation();
  const { restaurantId } = useRoute().params || {};
  const parentNav        = navigation.getParent();

  useEffect(() => {
    if (!restaurantId) {
      Alert.alert('Error', 'No restaurant selected');
      navigation.replace('OwnerHome');
    }
  }, [restaurantId]);

  useLayoutEffect(() => {
  const targetNav = parentNav ?? navigation;

  const goBackSafe = () => {
    if (targetNav?.canGoBack?.()) targetNav.goBack();
    else if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('OwnerHome');
  };

  targetNav?.setOptions({
    headerShown: true,
    title: 'Manage Menu',
    headerStyle: { backgroundColor: '#fff', elevation: 0 },
    headerTitleStyle: { color: '#111827', fontSize: 18, fontWeight: '700' },
    headerShadowVisible: false,

    // hide the default iOS back title completely
    headerBackTitleVisible: false,
    headerBackVisible: false,

    // custom left: gradient circle + pretty breadcrumb “Owner Home”
    headerLeft: () => (
      <TouchableOpacity
        onPress={goBackSafe}
        style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 6 }}
        hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#34D399', '#059669']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.headerBack}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </LinearGradient>

        <View style={styles.crumb}>
          <Feather name="home" size={12} color="#065f46" />
          <Text style={styles.crumbTxt}>Owner Home</Text>
        </View>
      </TouchableOpacity>
    ),
  });
}, [navigation, parentNav]);

  const [meals, setMeals]             = useState([]);
  const [name, setName]               = useState('');
  const [price, setPrice]             = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState('Food');
  const [photo, setPhoto]             = useState(null);
  const [busy, setBusy]               = useState(false);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');

  // options modal
  const [optOpen, setOptOpen] = useState(false);
  const [optMeal, setOptMeal] = useState(null);

  const loadMeals = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/api/menu/restaurants/${restaurantId}/meals`);
      const items = data.flatMap(section =>
        section.items.map(item => ({
          ...item,
          section: section.title,
          price: item.price != null ? Number(item.price) : null,
          discount: Number(item.discount) || 0,
          outOfStock: Number(item.outOfStock) || 0,
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

  useFocusEffect(useCallback(() => { loadMeals(); }, [loadMeals]));

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

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.7,
    });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  const handleAdd = async () => {
    if (!name.trim() || !price.trim()) return Alert.alert('Validation', 'Name & price required');
    const val = Number(price);
    if (isNaN(val)) return Alert.alert('Validation', 'Price must be a number');
    try {
      setBusy(true);
      await axios.post(`${API_BASE}/api/menu/restaurants/${restaurantId}/meals`, {
        name: name.trim(),
        price: val,
        photo: photo || '',
        description,
        section: category,
      });
      setName(''); setPrice(''); setDescription(''); setPhoto(null);
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
        text: 'Delete', style: 'destructive',
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

  const openOptions   = (meal) => { setOptMeal(meal); setOptOpen(true); };
  const openDiscount  = (meal) => navigation.navigate('EditItemModal', { ...meal, focus: 'discount' });
  const toggleStock   = async (meal) => {
    try {
      const newVal = meal.outOfStock ? 0 : 1;
      await axios.patch(`${API_BASE}/api/menu/meals/${meal.id}`, { outOfStock: newVal });
      setMeals(prev => prev.map(m => m.id === meal.id ? { ...m, outOfStock: newVal } : m));
    } catch {
      Alert.alert('Error', 'Could not update stock');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <SectionList
        sections={sections}
        keyExtractor={item => String(item.id)}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeader}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <MealCard
            item={item}
            styles={styles}
            navigation={navigation}
            openOptions={openOptions}
            openDiscount={openDiscount}
            toggleStock={toggleStock}
            handleDelete={handleDelete}
          />
        )}
        ListHeaderComponent={
          <>
            <View style={styles.searchWrap}>
              <Feather name="search" size={16} color="#9aa0a6" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items…"
                placeholderTextColor="#9aa0a6"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <AddMenuItemForm
              styles={styles}
              name={name} setName={setName}
              price={price} setPrice={setPrice}
              description={description} setDescription={setDescription}
              category={category} setCategory={setCategory}
              photo={photo} pickImage={pickImage}
              busy={busy} handleAdd={handleAdd}
            />
          </>
        }
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
        style={{ backgroundColor: '#f6f7fb' }}
      />

      <OptionsModal
        visible={optOpen}
        onClose={() => setOptOpen(false)}
        navigation={navigation}
        restaurantId={restaurantId}
        meal={optMeal}
      />
    </SafeAreaView>
  );
}

/* keep your existing styles exactly as before */
const styles = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#f6f7fb' },
  loader:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f6f7fb' },
  headerBack:{ width:36, height:36, borderRadius:18, justifyContent:'center', alignItems:'center',
    shadowColor:'#000', shadowOpacity:0.12, shadowRadius:6, shadowOffset:{ width:0, height:3 }, elevation:3 },
    crumb:{
   marginLeft: 8,
   flexDirection:'row',
   alignItems:'center',
   backgroundColor:'#e8faf3',
   paddingVertical:4,
   paddingHorizontal:10,
   borderRadius:999,
   borderWidth:1,
   borderColor:'#c7f0e3'
 },
 crumbTxt:{ marginLeft:6, color:'#065f46', fontWeight:'800', letterSpacing:0.2 },

  searchWrap:{ marginHorizontal:16, marginBottom:10, marginTop:4, flexDirection:'row', alignItems:'center',
    backgroundColor:'#fff', borderRadius:12, paddingHorizontal:12, height:44, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:8, elevation:1 },
  searchInput:{ flex:1, fontSize:14, color:'#111827' },

  cardShell:{ paddingHorizontal:16, marginTop:4 },
  form:{ borderRadius:16, padding:16, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:12, elevation:2, borderWidth:1, borderColor:'#eef2f7' },
  heading:{ fontSize:18, fontWeight:'800', marginBottom:14, color:'#0f172a' },
  input:{ backgroundColor:'#f7f8fa', borderRadius:10, paddingHorizontal:12, paddingVertical:10, fontSize:14, marginBottom:10, color:'#111827', borderWidth:1, borderColor:'#eef1f4' },
  textarea:{ height:88, textAlignVertical:'top' },

  pickRow:{ flexDirection:'row', marginBottom:10 },
  catBtn :{ flex:1, paddingVertical:10, marginHorizontal:4, borderRadius:999, backgroundColor:'#eef2f7', alignItems:'center', borderWidth:1, borderColor:'#e5eaf1' },
  catBtnActive:{ backgroundColor:'#10b981' },
  catTxt :{ fontSize:13, color:'#334155', fontWeight:'600' },
  catTxtActive:{ color:'#fff', fontWeight:'800' },

  photoRow:{ flexDirection:'row', alignItems:'center', marginBottom:10 },
  photoPlaceholder:{ width:96, height:72, borderRadius:12, backgroundColor:'#eef2f7', justifyContent:'center', alignItems:'center', marginRight:12, borderWidth:1, borderColor:'#e5eaf1' },
  photoPreview:{ width:96, height:72, borderRadius:12, marginRight:12 },
  photoBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#10b981', paddingVertical:10, paddingHorizontal:14, borderRadius:10, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:2 },
  photoBtnText:{ color:'#fff', fontWeight:'700', marginLeft:6 },

  gradientBtn:{ borderRadius:12, overflow:'hidden', marginTop:4 },
  btnInner:{ flexDirection:'row', alignItems:'center', justifyContent:'center', paddingVertical:12 },
  btnText:{ color:'#fff', fontWeight:'800', marginLeft:6, letterSpacing:0.3 },

  sectionHeaderWrap:{ paddingHorizontal:16, paddingTop:16 },
  sectionHeader:{ alignSelf:'flex-start', backgroundColor:'#e8faf3', color:'#065f46', fontWeight:'800',
    paddingVertical:6, paddingHorizontal:12, borderRadius:999, borderWidth:1, borderColor:'#c7f0e3', letterSpacing:0.2 },

  card:{ flexDirection:'row', alignItems:'center', backgroundColor:'#fff', marginHorizontal:16, marginVertical:6,
    borderRadius:16, padding:12, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:10, elevation:2, borderWidth:1, borderColor:'#eef2f7' },
  cardPressed:{ transform:[{ scale:0.98 }], opacity:0.95 },
  cardImg:{ width:62, height:62, borderRadius:12, marginRight:12, backgroundColor:'#f1f5f9' },
  cardBody:{ flex:1 },
  cardTitle:{ fontSize:16, fontWeight:'800', color:'#0f172a' },
  cardPrice:{ marginTop:4, color:'#475569', fontWeight:'700' },

  priceRow:{ flexDirection:'row', alignItems:'center', marginTop:4, flexWrap:'wrap' },
  priceStrikethrough:{ textDecorationLine:'line-through', color:'#9ca3af', marginRight:8, fontWeight:'600' },
  badge:{ backgroundColor:'#ecfdf5', paddingVertical:4, paddingHorizontal:8, borderRadius:8, borderWidth:1, borderColor:'#bbf7d0' },
  badgeTxt:{ color:'#065f46', fontWeight:'800' },
  discountTxt:{ marginLeft:8, color:'#b91c1c', fontWeight:'800' },

  oos:{ marginTop:4, color:'#ef4444', fontSize:12, fontWeight:'700' },
  cardAction:{ padding:8 },

  actionsRow:{ flexDirection:'row', marginTop:8, flexWrap:'wrap' },
  actionChip:{ flexDirection:'row', alignItems:'center', paddingVertical:7, paddingHorizontal:12, borderRadius:999, marginRight:8, marginTop:6, borderWidth:1 },
  actionTxt:{ marginLeft:6, fontSize:12, fontWeight:'800' },

  chipMint:{ backgroundColor:'#f0fdf4', borderColor:'#bbf7d0' },
  chipMintTxt:{ color:'#065f46' },
  chipAmber:{ backgroundColor:'#fffbeb', borderColor:'#fde68a' },
  chipAmberTxt:{ color:'#92400e' },
  chipSlate:{ backgroundColor:'#f1f5f9', borderColor:'#e2e8f0' },
  chipSlateTxt:{ color:'#334155' },
  chipBlue:{ backgroundColor:'#e0f2fe', borderColor:'#bae6fd' },
  chipBlueTxt:{ color:'#075985' },
  chipRose:{ backgroundColor:'#ffe4e6', borderColor:'#fecdd3' },
  chipRoseTxt:{ color:'#9f1239' },

  sheet:{ flex:1, backgroundColor:'#fff', paddingTop:8, paddingHorizontal:16, borderTopLeftRadius:20, borderTopRightRadius:20 },
  grabber:{ alignSelf:'center', width:42, height:5, borderRadius:999, backgroundColor:'#e5e7eb', marginTop:4, marginBottom:8 },
  modalHeadRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  modalFooter:{ flexDirection:'row', justifyContent:'space-between', marginTop:16 },
  closeBtn:{ backgroundColor:'#eef2f7', paddingVertical:10, paddingHorizontal:16, borderRadius:10, borderWidth:1, borderColor:'#e5eaf1' },
  primaryBtn:{ backgroundColor:'#10b981', paddingVertical:10, paddingHorizontal:18, borderRadius:10, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:8, elevation:2 },

  gName:{ fontWeight:'800', color:'#0f172a' },
  gMeta:{ color:'#64748b', fontSize:12, marginTop:2, fontWeight:'600' },
  attachRow:{ flexDirection:'row', alignItems:'center', backgroundColor:'#f8fafc', padding:12, borderRadius:12, marginTop:8, borderWidth:1, borderColor:'#eef2f7' },
  attachBtn:{ paddingVertical:8, paddingHorizontal:12, borderRadius:10, borderWidth:1, borderColor:'#e2e8f0' },
  btnOn:{ backgroundColor:'#d1fae5', borderColor:'#a7f3d0' },
  btnOff:{ backgroundColor:'#f1f5f9' },
  attachTxt:{ fontWeight:'800', color:'#0f172a' },

  modalTitle:{ fontSize:17, fontWeight:'800', color:'#111827' },
  sheetTitle:{ fontSize:16, fontWeight:'800', color:'#111' },
  label:{ fontSize:13, fontWeight:'800', color:'#374151', marginBottom:6 },
  smallLabel:{ fontSize:12, color:'#6b7280', marginBottom:6 },
  twoCol:{ flexDirection:'row', gap:12, marginBottom:12 },
  segment:{ flexDirection:'row', backgroundColor:'#f3f4f6', padding:4, borderRadius:999, alignSelf:'flex-start', borderWidth:1, borderColor:'#e5e7eb' },
  segmentBtn:{ paddingVertical:8, paddingHorizontal:14, borderRadius:999 },
  segmentOn:{ backgroundColor:'#fff', shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, elevation:1 },
  segmentTxt:{ color:'#374151', fontWeight:'700', textTransform:'capitalize' },
  segmentTxtOn:{ color:'#065f46' },
  cardToggle:{ flex:1, backgroundColor:'#fff', borderRadius:14, padding:12, borderWidth:1, borderColor:'#e5e7eb', shadowColor:'#000', shadowOpacity:0.04, shadowRadius:8, elevation:1 },
  cardToggleHead:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:4 },
  toggleTitle:{ fontWeight:'800', color:'#111' },
  hint:{ color:'#6b7280', fontSize:12 },
  optCard:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', borderRadius:14, padding:12, marginBottom:10, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:8, elevation:1 },
  optActions:{ justifyContent:'center', alignItems:'flex-end', marginLeft:10 },
  defaultBadge:{ flexDirection:'row', alignItems:'center', paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor:'#f3f4f6', alignSelf:'flex-end' },
  defaultBadgeOn:{ backgroundColor:'#fef3c7', borderWidth:1, borderColor:'#fde68a' },
  defaultTxt:{ fontSize:12, marginLeft:6, color:'#6b7280', fontWeight:'700' },
  deleteBtn:{ marginTop:8, alignSelf:'flex-end', padding:6 },
  addOptBtn:{ flexDirection:'row', alignItems:'center', alignSelf:'flex-start', paddingVertical:10, paddingHorizontal:14, borderRadius:999, backgroundColor:'#eef2ff', borderWidth:1, borderColor:'#e0e7ff' },
  addOptTxt:{ marginLeft:8, color:'#3730a3', fontWeight:'800' },
  link:{ color:'#10b981', fontWeight:'800' },
  chipBlue:{ backgroundColor:'#e0f2fe', borderColor:'#bae6fd' },
  chipBlueTxt:{ color:'#075985' },
  chipRose:{ backgroundColor:'#ffe4e6', borderColor:'#fecdd3' },
  chipRoseTxt:{ color:'#9f1239' },
  actionChip:{ flexDirection:'row', alignItems:'center', paddingVertical:7, paddingHorizontal:12, borderRadius:999, marginRight:8, marginTop:6, borderWidth:1 },
  actionTxt:{ marginLeft:6, fontSize:12, fontWeight:'800' },
  chipMint:{ backgroundColor:'#f0fdf4', borderColor:'#bbf7d0' },
  chipMintTxt:{ color:'#065f46' },
  chipAmber:{ backgroundColor:'#fffbeb', borderColor:'#fde68a' },
  chipAmberTxt:{ color:'#92400e' },
  chipSlate:{ backgroundColor:'#f1f5f9', borderColor:'#e2e8f0' },
  chipSlateTxt:{ color:'#334155' },
  cardAction:{ padding:8 },
});
