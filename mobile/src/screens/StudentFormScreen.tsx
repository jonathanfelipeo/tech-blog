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
import { createStudent, getStudentById, updateStudent } from '../api/client';

export const StudentFormScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const studentId: number | undefined = route.params?.studentId;
  const isEditing = !!studentId;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [registration, setRegistration] = useState('');
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
    if (isEditing && studentId) {
      const loadStudent = async () => {
        try {
          setLoading(true);
          const data = await getStudentById(studentId);
          setName(data.name);
          setEmail(data.email);
          setRegistration(data.registration || '');
        } catch (error) {
          notify('Erro', 'Não foi possível carregar os dados do aluno.');
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      loadStudent();
    }
  }, [isEditing, studentId]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      notify('Campos obrigatórios', 'Nome e e-mail do aluno são obrigatórios.');
      return;
    }
    if (!isEditing && !password.trim()) {
      notify('Senha obrigatória', 'Defina uma senha inicial para o aluno.');
      return;
    }
    if (password.trim() && password.trim().length < 6) {
      notify('Senha inválida', 'Use pelo menos 6 caracteres.');
      return;
    }

    try {
      setSaving(true);
      if (isEditing && studentId) {
        await updateStudent(studentId, {
          name: name.trim(),
          email: email.trim(),
          registration: registration.trim(),
          ...(password.trim() ? { password: password.trim() } : {}),
        });
        notify('Sucesso', 'Aluno atualizado com sucesso!');
      } else {
        await createStudent({
          name: name.trim(),
          email: email.trim(),
          registration: registration.trim(),
          password: password.trim(),
        });
        notify('Sucesso', 'Aluno cadastrado com sucesso!');
      }
      navigation.goBack();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao salvar aluno.';
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
          {isEditing ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
        </Text>

        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Lucas Martins"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: lucas.martins@aluno.fiap.com.br"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>RM / Matrícula</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: RM350123"
          value={registration}
          onChangeText={setRegistration}
        />

        <Text style={styles.label}>
          {isEditing ? 'Nova senha (opcional)' : 'Senha inicial (mínimo 6 caracteres)'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={isEditing ? 'Deixe em branco para manter' : 'Crie uma senha para o aluno'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
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
              {isEditing ? 'Salvar Alterações' : 'Cadastrar Aluno'}
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