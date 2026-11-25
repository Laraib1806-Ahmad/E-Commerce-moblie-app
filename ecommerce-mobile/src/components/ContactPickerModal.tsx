import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { PermissionPrompt } from "@/components/PermissionPrompt";
import { ThemedText } from "@/components/themed-text";

type Props = {
  visible: boolean;
  onClose: () => void;
  onPick: (name: string, phone: string) => void;
};

type Permission = Awaited<ReturnType<typeof Contacts.getPermissionsAsync>>;

export function ContactPickerModal({ visible, onClose, onPick }: Props) {
  const [permission, setPermission] = useState<Permission | null>(null);
  const [contacts, setContacts] = useState<Contacts.ExistingContact[]>([]);
  const [search, setSearch] = useState("");

  // Check the current permission every time the modal opens.
  useEffect(() => {
    if (visible) Contacts.getPermissionsAsync().then(setPermission);
  }, [visible]);

  const requestPermission = async () => {
    setPermission(await Contacts.requestPermissionsAsync());
  };

  useEffect(() => {
    if (!visible || !permission?.granted) return;
    Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
      sort: Contacts.SortTypes.FirstName,
    }).then(({ data }) =>
      setContacts(data.filter((c) => c.phoneNumbers?.length)),
    );
  }, [visible, permission?.granted]);

  const filtered = contacts.filter((c) =>
    (c.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {!permission ? null : !permission.granted ? (
        <View style={styles.flex}>
          <PermissionPrompt
            title="Contacts access"
            message="We use your contacts only to fill in a phone number."
            canAskAgain={permission.canAskAgain}
            onRequest={requestPermission}
          />
          <Pressable style={styles.close} onPress={onClose}>
            <ThemedText type="smallBold">Close</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.flex}>
          <TextInput
            placeholder="Search contacts..."
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => {
              const number = item.phoneNumbers?.[0]?.number ?? "";
              return (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    // Keep only digits and a leading plus sign.
                    onPick(item.name ?? "", number.replace(/[^\d+]/g, ""));
                    onClose();
                  }}
                >
                  <ThemedText type="smallBold">{item.name}</ThemedText>
                  <ThemedText type="small">{number}</ThemedText>
                </Pressable>
              );
            }}
          />
          <Pressable style={styles.close} onPress={onClose}>
            <ThemedText type="smallBold">Close</ThemedText>
          </Pressable>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, paddingTop: 48 },
  search: {
    margin: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  row: { paddingHorizontal: 16, paddingVertical: 10 },
  close: { alignSelf: "center", padding: 16 },
});
