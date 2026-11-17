import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createTeacher, getTeacherById, updateTeacher } from '../api/client';

export const TeacherFormScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const teacherId: number | undefined = route.params?.teacherId;
  const isEditing = !!teacherId;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const notify = (titleMsg: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titleMsg}: ${message}`);
    } else {
      Alert.alert(titleMsg, message);
    }
  };

  useEffect(() => {
    if (isEditing && teacherId) {
      const loadTeacher = async () => {
        try {
          setLoading(true);
          const data = await getTeacherById(teacherId);
          setName(data.name);
          setEmail(data.email);
          setSubject(data.subject || '');
        } catch (error) {
          notify('Erro', 'Não foi possível carregar os dados do professor.');
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      loadTeacher();
    }
  }, [isEditing, teacherId]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      notify('Campos obrigatórios', 'Nome e e-mail são obrigatórios.');
      return;
    }

    if (!isEditing && !password.trim()) {
      notify('Senha obrigatória', 'Defina uma senha inicial para o novo professor.');
      return;
    }

    try {
      setSaving(true);
      if (isEditing && teacherId) {
        await updateTeacher(teacherId, {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          ...(password.trim() ? { password: password.trim() } : {}),
        });
        notify('Sucesso', 'Professor atualizado com sucesso!');
      } else {
        await createTeacher({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          password: password.trim(),
        });
        notify('Sucesso', 'Professor cadastrado com sucesso!');
      }
      navigation.goBack();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao salvar professor.';
      notify('Erro', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Professor' : 'Cadastrar Novo Professor'}
        </Text>

        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Ana Souza"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: ana.souza@fiap.com.br"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Disciplina / Matéria</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Desenvolvimento Mobile"
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.label}>
          {isEditing ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha de Acesso'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Digite a senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Professor'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
