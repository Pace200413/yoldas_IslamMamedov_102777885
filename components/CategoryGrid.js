import React, { memo } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

const DATA = [
  { id: 'Food',       label: 'Food',       icon: require('../assets/icons/food.png') },
  { id: 'Car',        label: 'Car',        icon: require('../assets/icons/car.jpeg') },
  { id: 'Express',    label: 'Express',    icon: require('../assets/icons/express.png') },
  { id: 'Mart',       label: 'Mart',       icon: require('../assets/icons/mart.jpeg') },
  { id: 'Dine Out',   label: 'Dine Out',   icon: require('../assets/icons/dineout.jpg') },
  { id: 'Prepaid',    label: 'Prepaid',    icon: require('../assets/icons/profile.jpeg') },
  { id: 'Gifts',      label: 'Gifts',      icon: require('../assets/icons/promo.png') },
  { id: 'All',        label: 'All',        icon: require('../assets/icons/all.jpg') },
];

function CategoryGrid({ onSelect = () => {} }) {
  return (
    <View style={styles.grid}>
      {DATA.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.iconBox}
          onPress={() => onSelect(item.id === 'All' ? null : item.id)}
        >
          <Image source={item.icon} style={styles.iconImg} resizeMode="contain" />
          <Text style={styles.iconLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default memo(CategoryGrid);

const styles = StyleSheet.create({
 grid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: 16,
  justifyContent: 'space-between',
  marginTop: 10,       // ← add this line
  marginBottom: 12,
},
  iconBox: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconImg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#f3f4f6',
  },
  iconLabel: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
  },
});
