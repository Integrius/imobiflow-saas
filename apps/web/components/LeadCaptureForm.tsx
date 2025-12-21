'use client';

import { useState, useEffect } from 'react';
import { Building2, Home, DollarSign, MapPin, Bed, Car, Search } from 'lucide-react';

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  tipo_negocio: string;
  tipo_imovel_desejado: string;
  valor_minimo: string;
  valor_maximo: string;
  estado: string;
  municipio: string;
  bairro: string;
  complemento_localizacao: string;
  quartos_min: string;
  quartos_max: string;
  vagas_min: string;
  vagas_max: string;
  area_minima: string;
  aceita_pets: boolean;
  observacoes: string;
}

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Municipio {
  id: number;
  nome: string;
}

export default function LeadCaptureForm() {
  const API_URL = 'https://api.integrius.com.br';

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    email: '',
    tipo_negocio: '',
    tipo_imovel_desejado: '',
    valor_minimo: '',
    valor_maximo: '',
    estado: '',
    municipio: '',
    bairro: '',
    complemento_localizacao: '',
    quartos_min: '',
    quartos_max: '',
    vagas_min: '',
    vagas_max: '',
    area_minima: '',
    aceita_pets: false,
    observacoes: ''
  });

  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Carregar estados ao montar
  useEffect(() => {
    fetchEstados();
  }, []);

  // Carregar municípios quando estado muda
  useEffect(() => {
    if (formData.estado) {
      fetchMunicipios(formData.estado);
    }
  }, [formData.estado]);

  const fetchEstados = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/localidades/estados`);
      const data = await response.json();
      if (data.success) {
        setEstados(data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar estados:', err);
    }
  };

  const fetchMunicipios = async (uf: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/localidades/estados/${uf}/municipios`);
      const data = await response.json();
      if (data.success) {
        setMunicipios(data.data);
      }
    } catch (err) {
      console.error('Erro ao buscar municípios:', err);
    }
  };

  const formatCurrency = (value: string) => {
    const numero = value.replace(/\D/g, '');
    if (!numero) return '';
    const valorNumero = parseInt(numero) / 100;
    return valorNumero.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatPhone = (value: string) => {
    const numero = value.replace(/\D/g, '');
    if (numero.length <= 10) {
      return numero.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numero.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === 'telefone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
      return;
    }

    if (name === 'valor_minimo' || name === 'valor_maximo') {
      setFormData(prev => ({ ...prev, [name]: formatCurrency(value) }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Converter valores formatados para números
      const payload = {
        ...formData,
        valor_minimo: formData.valor_minimo ? parseFloat(formData.valor_minimo.replace(/\./g, '').replace(',', '.')) : undefined,
        valor_maximo: formData.valor_maximo ? parseFloat(formData.valor_maximo.replace(/\./g, '').replace(',', '.')) : undefined,
        quartos_min: formData.quartos_min ? parseInt(formData.quartos_min) : undefined,
        quartos_max: formData.quartos_max ? parseInt(formData.quartos_max) : undefined,
        vagas_min: formData.vagas_min ? parseInt(formData.vagas_min) : undefined,
        vagas_max: formData.vagas_max ? parseInt(formData.vagas_max) : undefined,
        area_minima: formData.area_minima ? parseFloat(formData.area_minima) : undefined,
      };

      const response = await fetch(`${API_URL}/api/v1/leads/captura`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Resetar formulário
        setFormData({
          nome: '',
          telefone: '',
          email: '',
          tipo_negocio: '',
          tipo_imovel_desejado: '',
          valor_minimo: '',
          valor_maximo: '',
          estado: '',
          municipio: '',
          bairro: '',
          complemento_localizacao: '',
          quartos_min: '',
          quartos_max: '',
          vagas_min: '',
          vagas_max: '',
          area_minima: '',
          aceita_pets: false,
          observacoes: ''
        });

        // Esconder mensagem de sucesso após 5 segundos
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Erro ao enviar formulário');
      }
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      setError('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-green-50 border-2 border-green-500 rounded-2xl text-center animate-slide-up">
        <div className="mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Cadastro realizado com sucesso!</h3>
        <p className="text-green-700 mb-4">
          Em breve você receberá sugestões de imóveis por email e WhatsApp.
        </p>
        <p className="text-sm text-green-600">
          Nossa equipe entrará em contato em até 24 horas.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Dados Pessoais */}
      <div className="glass-card p-8 space-y-6">
        <h3 className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2">
          <Home className="w-6 h-6 text-[#8FD14F]" />
          Seus Dados
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Telefone/WhatsApp *
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
              maxLength={15}
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              E-mail *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </div>
        </div>
      </div>

      {/* O que procura */}
      <div className="glass-card p-8 space-y-6">
        <h3 className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2">
          <Search className="w-6 h-6 text-[#8FD14F]" />
          O que você procura?
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Tipo de Negócio *
            </label>
            <select
              name="tipo_negocio"
              value={formData.tipo_negocio}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
            >
              <option value="">Selecione...</option>
              <option value="COMPRA">Comprar</option>
              <option value="ALUGUEL">Alugar</option>
              <option value="TEMPORADA">Temporada</option>
              <option value="VENDA">Vender meu imóvel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Tipo de Imóvel *
            </label>
            <select
              name="tipo_imovel_desejado"
              value={formData.tipo_imovel_desejado}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
            >
              <option value="">Selecione...</option>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="CASA">Casa</option>
              <option value="TERRENO">Terreno</option>
              <option value="COMERCIAL">Comercial/Loja</option>
              <option value="SOBRADO">Sobrado</option>
              <option value="COBERTURA">Cobertura</option>
              <option value="KITNET">Kitnet/Studio</option>
            </select>
          </div>
        </div>

        {/* Valores */}
        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#8FD14F]" />
            Faixa de Valor
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                name="valor_minimo"
                value={formData.valor_minimo}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
                placeholder="R$ Mínimo"
              />
            </div>
            <div>
              <input
                type="text"
                name="valor_maximo"
                value={formData.valor_maximo}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
                placeholder="R$ Máximo"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Localização */}
      <div className="glass-card p-8 space-y-6">
        <h3 className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#8FD14F]" />
          Localização
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Estado *
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
            >
              <option value="">Selecione...</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.sigla}>
                  {estado.sigla} - {estado.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Município *
            </label>
            <select
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              required
              disabled={!formData.estado}
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors disabled:bg-gray-100"
            >
              <option value="">Selecione...</option>
              {municipios.map(mun => (
                <option key={mun.id} value={mun.nome}>
                  {mun.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Bairro
            </label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
              placeholder="Bairro desejado"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
            Detalhes da localização
          </label>
          <input
            type="text"
            name="complemento_localizacao"
            value={formData.complemento_localizacao}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
            placeholder="Ex: Próximo ao shopping, região central..."
          />
        </div>
      </div>

      {/* Características */}
      <div className="glass-card p-8 space-y-6">
        <h3 className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2">
          <Building2 className="w-6 h-6 text-[#8FD14F]" />
          Características
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Quartos */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2 flex items-center gap-2">
              <Bed className="w-4 h-4 text-[#8FD14F]" />
              Quartos
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="quartos_min"
                value={formData.quartos_min}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
                placeholder="Mín"
              />
              <input
                type="number"
                name="quartos_max"
                value={formData.quartos_max}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
                placeholder="Máx"
              />
            </div>
          </div>

          {/* Vagas */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#8FD14F]" />
              Vagas de Garagem
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="vagas_min"
                value={formData.vagas_min}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
                placeholder="Mín"
              />
              <input
                type="number"
                name="vagas_max"
                value={formData.vagas_max}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
                placeholder="Máx"
              />
            </div>
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
              Área Mínima (m²)
            </label>
            <input
              type="number"
              name="area_minima"
              value={formData.area_minima}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors"
              placeholder="Ex: 80"
            />
          </div>

          {/* Pets */}
          <div className="flex items-center h-full">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="aceita_pets"
                checked={formData.aceita_pets}
                onChange={handleChange}
                className="w-5 h-5 text-[#8FD14F] border-2 border-[#E8E3DD] rounded focus:ring-[#8FD14F]"
              />
              <span className="text-sm font-medium text-[#2C2C2C]">
                Aceita animais de estimação
              </span>
            </label>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-[#2C2C2C] mb-2">
            Observações ou pedidos especiais
          </label>
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-[#E8E3DD] rounded-xl focus:border-[#8FD14F] focus:outline-none transition-colors resize-none"
            placeholder="Conte-nos mais sobre o que procura..."
          />
        </div>
      </div>

      {/* Botão de Envio */}
      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          className="px-12 py-4 bg-gradient-to-r from-[#8FD14F] to-[#6E9B3B] text-white font-bold text-lg rounded-full hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Enviando...
            </span>
          ) : (
            'Receber Sugestões de Imóveis'
          )}
        </button>
        <p className="mt-4 text-sm text-[#8B7F76]">
          Ao enviar, você receberá sugestões por email e WhatsApp
        </p>
      </div>
    </form>
  );
}
