import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const thumb = (src) =>
  typeof src === 'number' ? src : { uri: src }; // supports require() or uri

export default function CartItem({
  dealName,
  dealPrice,
  quantity,
  image,
  addQuantity,
  removeQuantity,
}) {
  return (
    <View style={styles.row}>
      {/* thumbnail */}
      <Image source={thumb(image)} style={styles.thumb} />

      {/* qty box */}
      <View style={styles.qtyBox}>
        <TouchableOpacity onPress={removeQuantity} style={styles.iconPad}>
          <AntDesign name="minus" size={12} />
        </TouchableOpacity>

        <Text style={styles.qtyText}>{quantity}</Text>

        <TouchableOpacity onPress={addQuantity} style={styles.iconPad}>
          <AntDesign name="plus" size={12} />
        </TouchableOpacity>
      </View>

      {/* name grows */}
      <Text numberOfLines={1} style={[styles.flex1, styles.name]}>
        {dealName}
      </Text>

      {/* price */}
      <Text style={styles.price}>RM {dealPrice.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  thumb: { width: 42, height: 42, borderRadius: 6, marginRight: 10 },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    marginRight: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  iconPad: { paddingHorizontal: 4 },
  qtyText: { marginHorizontal: 8, minWidth: 18, textAlign: 'center' },
  flex1:   { flex: 1 },
  name:    { fontSize: 15 },
  price:   { minWidth: 70, textAlign: 'right', fontWeight: '500' },
});
