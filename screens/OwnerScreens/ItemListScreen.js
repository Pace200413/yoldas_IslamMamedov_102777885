// screens/OwnerScreens/ItemListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useRestaurants } from '../../context/RestaurantContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

export default function ItemListScreen() {
  const route      = useRoute();
  const navigation = useNavigation();
  const { restaurantId } = route.params;
  const {
    restaurants,
    upsertMenuItem,
    deleteMenuItem
  } = useRestaurants();

  // Find this restaurant’s menu
  const restaurant = restaurants.find(r => r.id === restaurantId);
  const [menu, setMenu] = useState(restaurant?.menu || []);

  useEffect(() => {
    setMenu(restaurant?.menu || []);
  }, [restaurants]);

  // Delete handler
  const onDelete = (id) => deleteMenuItem(restaurantId, id);

  const renderRow = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity style={styles.delBtn} onPress={() => onDelete(item.id)}>
          <Feather name="trash-2" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          navigation.navigate('EditItemModal', { restaurantId, item })
        }
      >
        <Text style={styles.name}>
          {item.name}{!item.available && ' (❌)'}
        </Text>
        <Text>
          ${item.price.toFixed(2)}
          {item.discount > 0 && ` (-${item.discount}%)`}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Items</Text>
      </View>

      {/* Menu List */}
      <FlatList
        data={menu}
        keyExtractor={i => i.id}
        renderItem={renderRow}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Add Item FAB */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() =>
          navigation.navigate('EditItemModal', { restaurantId })
        }
      >
        <Feather name="plus-circle" size={24} color="#fff" />
        <Text style={styles.addTxt}>Add Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600'
  },
  row: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  separator: {
    height: 1,
    backgroundColor: '#eee'
  },
  delBtn: {
    width: 60,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 5 }
    })
  },
  addTxt: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8
  }
});
