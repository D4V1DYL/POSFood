import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const CustomAlert = ({ visible, onConfirm, onCancel }: { visible: boolean, onConfirm: () => void, onCancel: () => void }) => {
  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Are you sure?</Text>
          <Text style={styles.modalSubtitle}>You will change account.</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={onConfirm}>
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function HomeScreen() {
  const [waiterCode, setWaiterCode] = useState<string>('');
  const [isWaiterCodeEntered, setIsWaiterCodeEntered] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const loadWaiterCode = async () => {
      const savedWaiterCode = await AsyncStorage.getItem('waiterCode');
      if (savedWaiterCode) {
        setWaiterCode(savedWaiterCode);
        setIsWaiterCodeEntered(true);
      }
    };
    loadWaiterCode();
  }, []);

  // Handle code confirmation
  const handleConfirmWaiterCode = async () => {
    if (waiterCode.trim()) {
      await AsyncStorage.setItem('waiterCode', waiterCode);
      setIsWaiterCodeEntered(true);
    }
  };

  // Handle change user action
  const handleChangeUser = () => {
    setIsModalVisible(true);
  };

  const handleConfirmChangeUser = async () => {
    await AsyncStorage.removeItem('waiterCode');
    setWaiterCode('');
    setIsWaiterCodeEntered(false);
    setIsModalVisible(false);
  };

  const handleCancelChangeUser = () => {
    setIsModalVisible(false);
  };

  if (!isWaiterCodeEntered) {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredContainer}
        >
          <Text style={styles.title}>Enter Your Waiter Code</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={24} color="#6D5F9A" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter waiter code"
              placeholderTextColor="#A5A1C2"
              value={waiterCode}
              onChangeText={setWaiterCode}
              keyboardType="default"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleConfirmWaiterCode}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // Welcome screen after entering the code
  return (
    <View style={styles.container}>
      <View style={styles.centeredWelcomeContainer}>
        {/* Change user button now wraps both icon and text */}
        <TouchableOpacity style={styles.changeUserButton} onPress={handleChangeUser}>
          <Ionicons name="person" size={24} color="#FFF" />
          <Text style={styles.changeUserText}>Change User</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChangeUser}>
          <Image
            source={require('../../assets/images/BiliardLogo.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Welcome, {waiterCode}!</Text>
        <Text style={styles.subText}>Ready to take some orders?</Text>
      </View>
      <CustomAlert
        visible={isModalVisible}
        onConfirm={handleConfirmChangeUser}
        onCancel={handleCancelChangeUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F0FA',
  },
  centeredContainer: {
    width: '90%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4C3A8C',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEAFB',
    borderWidth: 1,
    borderColor: '#D6D1E8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    width: '100%',
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#4C3A8C',
  },
  button: {
    backgroundColor: '#6A5ACD',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  centeredWelcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4C3A8C',
    textAlign: 'center',
    marginTop: 20,
  },
  subText: {
    fontSize: 16,
    color: '#6D5F9A',
    marginTop: 10,
    textAlign: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  changeUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    bottom: 150,
    right: 90,
  },
  changeUserText: {
    marginLeft: 10,
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C3A8C',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6D5F9A',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#6A5ACD',
    borderRadius: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});