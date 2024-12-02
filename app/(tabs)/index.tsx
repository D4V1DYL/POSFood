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
  BackHandler,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import * as Clipboard from 'expo-clipboard';

const CustomAlert = ({
  visible,
  onConfirm,
  onCancel,
  itemToChange,
}: {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  itemToChange: string; // Accept item to change (WaiterCode or ServerIP)
}) => {
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
          <Text style={styles.modalSubtitle}>
            You will change {itemToChange}.
          </Text>
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
  const [serverIP, setServerIP] = useState<string>('');  
  const [isWaiterCodeEntered, setIsWaiterCodeEntered] = useState<boolean>(false);
  const [isServerIPEntered, setIsServerIPEntered] = useState<boolean>(false); 
  const [uuidValue, setUuidValue] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [itemToChange, setItemToChange] = useState<string>(''); 
  const [showUuid, setShowUuid] = useState<boolean>(false);


  useEffect(() => {
    const fetchUuid = async () => {
      try {
        const storedUuid = await AsyncStorage.getItem('uuid');
        if (storedUuid) {
          setUuidValue(storedUuid);
        } else {
          const newUuid = uuid.v4() as string;
          await AsyncStorage.setItem('uuid', newUuid);
          setUuidValue(newUuid);
        }
      } catch (error) {
        console.error('Error fetching UUID:', error);
      }
    };

    fetchUuid();
  }, []);


  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(uuidValue);
    Alert.alert('Copied to Clipboard', 'UUID has been copied to clipboard.');
  };


  useEffect(() => {
    const loadData = async () => {
      const savedWaiterCode = await AsyncStorage.getItem('waiterCode');
      const savedServerIP = await AsyncStorage.getItem('serverBEIP');
      if (savedWaiterCode) {
        setWaiterCode(savedWaiterCode);
        setIsWaiterCodeEntered(true);
      }
      if (savedServerIP) {
        setServerIP(savedServerIP);
        setIsServerIPEntered(true);
      }
    };
    loadData();
  }, []);

  const handleConfirm = async () => {
    if (waiterCode.trim()) {
      await AsyncStorage.setItem('waiterCode', waiterCode);
      setIsWaiterCodeEntered(true);
    }
    if (serverIP.trim()) {
      await AsyncStorage.setItem('serverBEIP', serverIP);
      setIsServerIPEntered(true);
    }
  };

  // Handle change user action - show modal
  const handleChangeUser = () => {
    setItemToChange('Waiter Code');
    setIsModalVisible(true);
  };

  // Handle change server IP action - show modal
  const handleChangeServerIP = () => {
    setItemToChange('Server IP');
    setIsModalVisible(true);
  };

  useEffect(() => {
    const backAction = () => {
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const handleConfirmChange = async () => {
    if (itemToChange === 'Waiter Code') {
      await AsyncStorage.removeItem('waiterCode');
      setWaiterCode('');
      setIsWaiterCodeEntered(false);
    } else if (itemToChange === 'Server IP') {
      await AsyncStorage.removeItem('serverBEIP');
      setServerIP('');
      setIsServerIPEntered(false);
    }
    setIsModalVisible(false);
  };

  const handleCancelChange = () => {
    setIsModalVisible(false);
  };

  if (!isWaiterCodeEntered || !isServerIPEntered) {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredContainer}
        >
          <Text style={styles.title}>Enter Your Waiter Code & Server IP</Text>
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
          <View style={styles.inputContainer}>
            <Ionicons name="server-outline" size={24} color="#6D5F9A" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter server IP"
              placeholderTextColor="#A5A1C2"
              value={serverIP}
              onChangeText={setServerIP}
              keyboardType="default"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.centeredWelcomeContainer}>
        <TouchableOpacity style={styles.changeUserButton} onPress={handleChangeUser}>
          <Ionicons name="person" size={24} color="#FFF" />
          <Text style={styles.changeUserText}>Change User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.changeServerButton} onPress={handleChangeServerIP}>
          <Ionicons name="server-outline" size={24} color="#FFF" />
          <Text style={styles.changeUserText}>Change Server IP</Text>
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/Logo_Netral_final-modified.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>Welcome, {waiterCode}!</Text>
        <Text style={styles.subText}>Server IP: {serverIP}</Text>
        <Text style={styles.subText}>Ready to take some orders?</Text>
      </View>
      <CustomAlert
        visible={isModalVisible}
        onConfirm={handleConfirmChange}
        onCancel={handleCancelChange}
        itemToChange={itemToChange}
      />
      <TouchableOpacity onPress={() => setShowUuid(!showUuid)}>
        <Text style={styles.showCodeText}>{showUuid ? 'Hide Id' : 'Show Id'}</Text>
      </TouchableOpacity>
     {showUuid && (
        <View style={styles.uuidContainer}>
          <Text style={styles.uuidText}>{uuidValue}</Text>
          <TouchableOpacity onPress={copyToClipboard}>
            <Text style={styles.copyText}>Copy Id</Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 17.1,
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
    bottom: 85,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4C3A8C',
    textAlign: 'center',
    top: 50,
  },
  subText: {
    fontSize: 16,
    color: '#6D5F9A',
    top: 50,
    textAlign: 'center',
  },
  logo: {
    width: 300,
    height: 200,
    top: 50,
    left:5
  },
  changeUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    bottom: 20,
    right: 105,
  },
  changeServerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
    padding: 10,
    borderRadius: 50,
    elevation: 5,
    bottom: 65,
    left: 85,
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
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4C3A8C',
  },
  modalSubtitle: {
    fontSize: 18,
    color: '#6D5F9A',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#6A5ACD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  uuidContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  uuidText: {
    fontSize: 16,
    color: '#333',
  },
  copyText: {
    fontSize: 16,
    color: '#7B68EE',
    marginTop: 10,
  },
  showCodeText: {
    fontSize: 16,
    color: '#7B68EE',
    textAlign: 'center',
    marginTop: 20,
  },
});
