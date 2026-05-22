'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp, Send, Loader2, CheckCircle2, Mail } from 'lucide-react'

const FAQ = [
  {
    q: 'D-Console\'u kullanmak için API key gerekli mi?',
    a: 'Evet, D-Console AI özelliklerini kullanmak için kendi Anthropic API key\'inizi girmeniz gerekiyor. API key\'inizi console.anthropic.com adresinden ücretsiz alabilirsiniz. Key\'iniz şifreli olarak saklanır ve yalnızca sizin isteklerinizde kullanılır.',
  },
  {
    q: 'STL dosyalarım ne kadar boyutta olabilir?',
    a: 'STL dosyaları maksimum 50MB olabilir. Görsel dosyalar (PNG, JPG, JPEG, PDF, DOCX) ise maksimum 5MB ile sınırlıdır. Dosyalar Supabase Storage\'da güvenli şekilde saklanır.',
  },
  {
    q: 'Vaka Pratiği özelliğini kullanmak için hangi planı almam gerekiyor?',
    a: 'Vaka Pratiği ve Topluluk yazma özellikleri M2 (Profesyonel, $17/ay) ve M3 (B2B, $45/ay) planlarda mevcuttur. M1 planında Topluluk\'u okuma modunda görüntüleyebilirsiniz.',
  },
  {
    q: 'Aboneliğimi nasıl iptal edebilirim?',
    a: 'Aboneliğinizi Stripe müşteri portalı üzerinden istediğiniz zaman iptal edebilirsiniz. İptal işleminden sonra mevcut dönem sonuna kadar tüm özelliklere erişiminiz devam eder.',
  },
  {
    q: 'Planım özelliği nasıl çalışıyor?',
    a: 'Planım, AI ile sohbet ederek adım adım öğrenme planı oluşturduğunuz bir özelliğir. Her adımı tamamladığınızda AI bir sonraki adımı otomatik üretir. Plan adımlarınız gerçek zamanlı olarak kaydedilir.',
  },
  {
    q: 'Verilerimi silmek istiyorum, ne yapmalıyım?',
    a: 'Verilerinizi silmek için destek formu aracılığıyla bizimle iletişime geçin. GDPR kapsamında tüm verileriniz 30 gün içinde kalıcı olarak silinir.',
  },
]

function FAQItem({ item, index }: { item: typeof FAQ[0]; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-[rgba(229,231,235,0.08)] rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-[#161617] hover:bg-[#1f1f20] transition-colors"
      >
        <span className="text-[#ffffff] text-sm font-medium pr-4">{item.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#999999] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#999999] shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-[#161617]">
          <p className="text-[#999999] text-sm leading-relaxed">{item.a}</p>
        </div>
      )}
    </motion.div>
  )
}

export default function SupportPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [isSending, startSend] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startSend(async () => {
      await new Promise(r => setTimeout(r, 800))
      setSent(true)
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-8 space-y-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-[#2563eb]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#ffffff]">Destek</h1>
          <p className="text-[#999999] text-sm">Sorularınız için buradayız</p>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-[#2563eb]" />
          <h2 className="text-[#ffffff] font-medium">Sık Sorulan Sorular</h2>
        </div>
        <div className="space-y-2">
          {FAQ.map((item, i) => <FAQItem key={i} item={item} index={i} />)}
        </div>
      </div>

      {/* Contact Form */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-[#2563eb]" />
          <h2 className="text-[#ffffff] font-medium">Bize Yazın</h2>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20 flex flex-col items-center text-center gap-3"
          >
            <CheckCircle2 className="w-8 h-8 text-[#2563eb]" />
            <p className="text-[#ffffff] font-medium">Mesajınız alındı!</p>
            <p className="text-[#999999] text-sm">En kısa sürede size geri döneceğiz. Genellikle 24 saat içinde yanıt veriyoruz.</p>
            <button onClick={() => { setSent(false); setSubject(''); setMessage('') }} className="text-[#2563eb] text-sm hover:underline">
              Yeni mesaj gönder
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-xl bg-[#161617] border border-[rgba(229,231,235,0.08)]">
            <div>
              <label className="block text-[#ffffff] text-sm mb-1.5">Konu</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Sorununuzu özetleyin"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#ffffff] text-sm mb-1.5">Mesaj</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Sorununuzu detaylı açıklayın..."
                rows={5}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f20] border border-[rgba(229,231,235,0.08)] text-[#ffffff] placeholder:text-[#999999] text-sm resize-none focus:outline-none focus:border-[#2563eb] transition-colors"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black font-medium text-sm disabled:opacity-50 cursor-pointer"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gönder
            </motion.button>
          </form>
        )}
      </div>
    </div>
  )
}
