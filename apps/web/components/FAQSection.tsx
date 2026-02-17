'use client';

import { useState } from 'react';
import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "O que é um CRM imobiliário?",
    answer: "Um CRM (Customer Relationship Management) imobiliário é um sistema de gestão de relacionamento com clientes especializado para imobiliárias e corretores. Ele permite organizar clientes, acompanhar negociações, automatizar follow-ups e centralizar todas as informações de clientes e imóveis em um único lugar."
  },
  {
    question: "O Integrius tem inteligência artificial?",
    answer: "Sim! O Integrius conta com a Sofia, nossa assistente de IA que qualifica clientes automaticamente, atribui pontuações de 0 a 100, identifica pontos fortes e fracos de cada cliente e sugere os próximos passos. Ela também faz match automático entre clientes e imóveis disponíveis."
  },
  {
    question: "Quanto custa o Integrius?",
    answer: "O Integrius oferece planos a partir de R$ 97/mês para corretores autônomos, R$ 197/mês para imobiliárias em crescimento e R$ 397/mês para grandes operações. Todos os planos incluem 14 dias de teste grátis, sem necessidade de cartão de crédito."
  },
  {
    question: "Posso integrar o Integrius com WhatsApp?",
    answer: "Sim! O plano Profissional e Enterprise incluem integração nativa com WhatsApp Business e Telegram. Você pode receber clientes automaticamente desses canais e as notificações são enviadas instantaneamente para os corretores responsáveis."
  },
  {
    question: "Como funciona o período de teste grátis?",
    answer: "Você pode testar todas as funcionalidades do Integrius por 14 dias gratuitamente. Não é necessário cadastrar cartão de crédito para iniciar o teste. Se gostar, escolha um plano e continue usando. Se não, seus dados são preservados por 30 dias caso queira voltar."
  },
  {
    question: "Meus dados estão seguros no Integrius?",
    answer: "Absolutamente! O Integrius utiliza criptografia de ponta a ponta, servidores seguros na AWS e está em total conformidade com a LGPD (Lei Geral de Proteção de Dados). Além disso, realizamos backups automáticos diários para garantir que seus dados nunca sejam perdidos."
  },
  {
    question: "Quantos usuários posso ter no sistema?",
    answer: "Depende do plano escolhido: o plano Básico permite até 3 usuários, o Profissional permite até 10 usuários, e o Enterprise oferece usuários ilimitados. Cada usuário pode ter permissões personalizadas (Admin, Gestor ou Corretor)."
  }
];

// JSON-LD Schema for FAQ Page
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqData.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
};

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section id="faq" className="py-24 px-6 bg-[#F4F6F8]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#064E3B] mb-4">
              Perguntas Frequentes sobre CRM Imobiliário
            </h2>
            <p className="text-xl text-gray-700">
              Tire suas dúvidas sobre o Integrius
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-bold text-[#064E3B]">
                    {item.question}
                  </span>
                  <svg
                    className={`w-6 h-6 text-[#00C48C] flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Ainda tem dúvidas? Fale com nossa equipe.
            </p>
            <a
              href="mailto:contato@integrius.com.br"
              className="inline-flex items-center gap-2 text-[#00C48C] font-bold hover:text-[#00B07D] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contato@integrius.com.br
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
