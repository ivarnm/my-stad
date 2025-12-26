import { ContentBlock, WeatherAlert } from 'src/server/actions/weather'
import { Fragment, ReactNode } from "react";
import Image from 'next/image';
import Link from 'next/link';

export default function AlertInfo({ alert }: { alert: WeatherAlert }) {
  return (
    <article aria-labelledby={`alert-${alert.id}`}>
      <header className='flex gap-4 items-center'>
        <Image
          src={`https://nrkno.github.io/yr-warning-icons/png/${alert.warningIcon}`}
          alt={alert.title}
          width={30}
          height={30}
          style={{ width: '30px', height: '30px' }} />
        <div>
          <h3 className='font-bold text-lg' id={`alert-${alert.id}`}>{alert.title}</h3>
          <p>{alert.severity}</p>
        </div>


      </header>

      <section className="flex flex-col">
        {alert.content.map((block, i) => renderBlock(block, i))}
      </section>
    </article>
  );
}

function renderBlock(block: ContentBlock, index: number) {
  const renderer = blockRenderers[block.type];

  if (!renderer) {
    console.warn(`No renderer for content type: ${block.type}`);
    return null;
  }

  return <div key={index}>{renderer(block as never)}</div>;
}


type BlockRenderer<T extends ContentBlock["type"]> = (
  block: Extract<ContentBlock, { type: T }>
) => ReactNode;

const blockRenderers: {
  [K in ContentBlock["type"]]: BlockRenderer<K>;
} = {
  "heading-2": block => <h4 className='font-bold mt-4'>{block.text}</h4>,

  text: block => <p>{block.text}</p>,

  link: block => {
    if (!block.text.includes(block.linkText)) {
      return <p>{block.text}</p>;
    }

    const parts = block.text.split(block.linkText);

    return (
      <p>
        {parts.map((part, index) => (
          <Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <Link href={block.url} className="underline" target='_blank'>
                {block.linkText}
              </Link>
            )}
          </Fragment>
        ))}
      </p>
    )
  },

  list: block => (
    <ul>
      {block.items.map((item, i) => (
        <li key={i}>{item.text}</li>
      ))}
    </ul>
  ),

  timeline: block => (
    <div className="ml-1">
      {block.items.map((item, i) => (
        <div key={i} className='flex gap-3 relative'>
          {i !== block.items.length - 1 && (
            <div className="absolute left-[6.5px] top-5 bottom-0 w-px border-l border-dashed border-gray-400 dark:border-gray-500" />
          )}
          {block.items.length === 1 && (
            <>
              <div className="absolute left-[6.5px] top-5 h-4 w-px border-l border-dashed border-gray-400 dark:border-gray-500" />
              <div className="absolute -left-[3px] top-8 text-gray-400 dark:text-gray-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </>
          )}
          <span className="material-symbols-outlined text-sm! mt-0.5 shrink-0">
            radio_button_checked
          </span>
          <div className={block.items.length === 1 ? "pb-8" : i === block.items.length - 1 ? "" : "pb-1"}>
            {item.text}
          </div>
        </div>
      ))}
    </div>
  ),

  image: block => (
    <Image
      src={block.url}
      alt={block.description}
      width={500}
      height={300}
      style={{ maxWidth: '100%', height: 'auto', marginTop: '1rem' }}
    />
  ),

  severity: block => {
    const getLevelColor = (severity: string) => {
      switch (severity) {
        case "Minor": return "bg-green-500";
        case "Moderate": return "bg-yellow-400";
        case "Severe": return "bg-orange-400";
        case "Extreme": return "bg-red-600";
        case "Ultra": return "bg-red-700";
        default: return "bg-gray-400";
      }
    };

    return (
      <section className="mt-1">
        <ul className="list-none pl-0! space-y-2">
          {block.dangerLevels.map(level => (
            <li
              key={level.severity}
              className={`flex items-center gap-3 ${!level.disabled ? 'text-foreground font-medium' : 'text-(--text-subtle)'}`}
              aria-current={level.selected ? "true" : undefined}
            >
              <div className={`w-5 h-5 border flex items-center justify-center shrink-0 border-foreground ${getLevelColor(level.severity)}`}>
                {level.selected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--surface-default)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
              <span>{level.description}</span>
            </li>
          ))}
        </ul>

        {block.helpText && <div className="mt-1">{blockRenderers.link(block.helpText)}</div>}
      </section>
    );
  },
};
