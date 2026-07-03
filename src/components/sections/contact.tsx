import { useRef } from 'react'

import Reveal from '@/components/reveal'
import contact from '@/data/contact.json'

const FORM_DELAY = 0.1

/**
 *
 */
export default function Contact(): React.ReactElement {
  return (
    <section
      className="section-glow section-glow-mixed relative overflow-hidden py-20"
      id="contact"
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        <Reveal direction="fade" variant="slide">
          <h2 className="gradient-underline mb-4 font-heading text-3xl font-bold text-[var(--fg)] md:text-5xl">
            {contact.contact.heading}
          </h2>
          <p className="mb-8 text-lg text-[var(--fg-muted)]">
            {contact.contact.subheading}
          </p>
        </Reveal>

        <Reveal delay={FORM_DELAY} direction="fade" variant="slide">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  )
}

/**
 *
 */
function ContactForm(): React.ReactElement {
  const formReference = useRef<HTMLFormElement>(null)

  /**
   *
   * @param event
   */
  function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = form.get('name') as string
    const email = form.get('email') as string
    const message = form.get('message') as string
    const subject = `Contact from ${name}`
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    window.open(
      `mailto:${contact.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    )
    formReference.current?.reset()
  }

  return (
    <div className="rounded-2xl p-8">
      <form className="space-y-4" onSubmit={handleSubmit} ref={formReference}>
        <FormFields />
        <button
          className="btn-ripple w-full rounded-full bg-[var(--color-molten-amber)] px-8 py-3.5 text-base font-semibold text-[#0A0E17] shadow-[var(--color-molten-amber)]/20 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[var(--color-molten-amber)]/90"
          type="submit"
        >
          {contact.contact.submitLabel}
        </button>
      </form>
      <ContactLinks />
    </div>
  )
}

/**
 *
 */
function ContactLinks(): React.ReactElement {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
      <a
        className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        href={`mailto:${contact.contact.email}`}
      >
        {contact.contact.email}
      </a>
      <span className="hidden text-[var(--fg-muted)]/30 sm:inline">·</span>
      <a
        className="text-sm text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
        href="#contact"
      >
        {contact.contact.bookCallLabel}
      </a>
    </div>
  )
}

/**
 *
 */
function FormFields() {
  return (
    <>
      <InputField
        id="contact-name"
        name="name"
        placeholder="Your name"
        type="text"
      />
      <InputField
        id="contact-email"
        name="email"
        placeholder="Your email"
        type="email"
      />
      <TextareaField
        id="contact-message"
        name="message"
        placeholder="Tell me about your project..."
      />
    </>
  )
}

/**
 *
 * @param root0
 * @param root0.id
 * @param root0.name
 * @param root0.placeholder
 * @param root0.type
 */
function InputField({
  id,
  name,
  placeholder,
  type,
}: Readonly<{ id: string; name: string; placeholder: string; type: string }>) {
  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {placeholder}
      </label>
      <input
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--color-signal-indigo)] focus:ring-2 focus:ring-[var(--color-signal-indigo)]/20 focus:outline-none"
        id={id}
        name={name}
        placeholder={placeholder}
        type={type}
      />
    </>
  )
}

/**
 *
 * @param root0
 * @param root0.id
 * @param root0.name
 * @param root0.placeholder
 */
function TextareaField({
  id,
  name,
  placeholder,
}: Readonly<{ id: string; name: string; placeholder: string }>) {
  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {placeholder}
      </label>
      <textarea
        className="min-h-[120px] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:border-[var(--color-signal-indigo)] focus:ring-2 focus:ring-[var(--color-signal-indigo)]/20 focus:outline-none"
        id={id}
        name={name}
        placeholder={placeholder}
      />
    </>
  )
}
