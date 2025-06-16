import React, { FC, useCallback } from "react";
import {
    FlatList,
    ListRenderItemInfo,
    Modal,
    Pressable,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Device } from "react-native-ble-plx";

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, connectToPeripheral, closeModal } = props;

  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);

  return (
    <Pressable
      onPress={connectAndCloseModal}
      className="bg-black justify-center items-center h-12 mx-5 mb-1 rounded-lg"
    >
      <Text className="text-lg font-bold text-white">{item.item.name}</Text>
    </Pressable>
  );
};

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { devices, visible, connectToPeripheral, closeModal } = props;

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral]
  );

  return (
    <Modal
      className="flex-1 bg-white"
      animationType="slide"
      transparent={false}
      visible={visible}
    >
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-5 pt-10">
          <Text className="text-2xl font-bold text-black text-center mb-5">
            Tap on a device to connect
          </Text>
          <TouchableOpacity onPress={closeModal} className="p-2">
            <Text className="text-black font-bold">Close</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          className="flex-1 "
          data={devices}
          renderItem={renderDeviceModalListItem}
          contentContainerStyle={{ justifyContent: "center" }}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default DeviceModal;