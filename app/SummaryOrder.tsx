import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Order {
  id: string;
  itemId: number;
  item: string;
  note: string;
  quantity: number;
}

const OrderReviewScreen: React.FC = () => {
  const router = useRouter();
  const { cartItems, tableNumber } = useLocalSearchParams();
  const [waiterCode, setWaiterCode] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState<string>('');

  // Fetch waiter code from AsyncStorage
  const fetchWaiterCode = async () => {
    try {
      const storedWaiterCode = await AsyncStorage.getItem('waiterCode');
      if (storedWaiterCode) {
        setWaiterCode(storedWaiterCode);
      }
    } catch (error) {
      console.error('Error fetching waiterCode:', error);
    }
  };

  // Parse cart items and initialize orders on component mount
  useEffect(() => {
    if (cartItems) {
      const parsedCartItems = JSON.parse(cartItems as string);
      const initialOrders: Order[] = parsedCartItems.map((cartItem: any) => ({
        item: cartItem.item.name,
        itemId: cartItem.item.itemId,
        note: cartItem.keterangan,
        quantity: cartItem.quantity,
      }));

      const menuItemsWithId = initialOrders.map((item, index) => ({
        ...item,
        id: (index + 1).toString(),
      }));

      
      setOrders(menuItemsWithId);
    }
    fetchWaiterCode();
  }, [cartItems]);

  // Handle quantity change for an item
  const handleQuantityChange = (id: string, change: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, quantity: Math.max(1, order.quantity + change) } : order
      )
    );
  };

  // Submit the order to the backend or simulate submission
  const handleOrderSubmission = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a customer name.');
      return;
    }

    // Prepare data for submission
    const payload = {
      waiterCode,
      tableNumber,
      customerName: name,
      orders,
    };

    try {
      console.log('Order Data:', payload);  // Simulate API call
      Alert.alert('Success', 'Order submitted successfully!');
      router.push('/');  // Navigate back to home or another screen
    } catch (error) {
      Alert.alert('Error', 'Failed to submit the order.');
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>{item.item}</Text>
        <Text style={styles.noteText}>{item.note}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, -1)}>
          <Ionicons name="remove-circle-outline" size={24} color="#4C3A8C" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, 1)}>
          <Ionicons name="add-circle-outline" size={24} color="#4C3A8C" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalItems = orders.reduce((total, order) => total + order.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#4C3A8C" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Summary</Text>
      </View>
      <View style={styles.tableInfo}>
        <Text style={styles.tableText}>You're in table: {tableNumber || 'N/A'}</Text>
        <View style={styles.nameContainer}>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Customer Name"
          />
          <Ionicons name="pencil" size={20} color="#7B68EE" />
        </View>
      </View>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.detailsText}>Total items: {totalItems}</Text>
      </View>
      <TouchableOpacity style={styles.orderButton} onPress={handleOrderSubmission}>
        <View style={styles.buttonBackground}>
          <Text style={styles.buttonText}>Order!</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5EFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 27,
    marginRight: 70,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C3A8C',
    right: 45
  },
  tableInfo: {
    marginBottom: 20,
  },
  tableText: {
    fontSize: 20,
    color: 'black',
    marginBottom: 10,
    fontWeight: 'bold',

  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#7B68EE',
    flex: 1,
    marginRight: 10,
    fontSize: 16,
    color: '#4C3A8C',
  },
  list: {
    flex: 1,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFF',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C3A8C',
  },
  noteText: {
    fontSize: 14,
    color: '#4C3A8C',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#4C3A8C',
  },
  detailsContainer: {
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 20,
  },
  detailsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C3A8C',
    textAlign: 'center',
  },
  orderButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    backgroundColor: '#7B68EE',
  },
  buttonBackground: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default OrderReviewScreen;