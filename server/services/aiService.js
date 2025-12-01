import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSummary(scrapedData) {
  try {
    // Prepare content for summarization
    const content = scrapedData
      .map((item, index) => {
        const title = item.title || item.name || `Item ${index + 1}`;
        const description = item.description || item.content || item.text || '';
        return `### ${title}\n${description}`;
      })
      .join('\n\n');

    // Truncate if too long (GPT-4 context limit)
    const maxLength = 100000;
    const truncatedContent = content.length > maxLength 
      ? content.substring(0, maxLength) + '\n\n[Content truncated...]'
      : content;

    const prompt = `Sei un esperto analista che deve creare un riassunto completo e dettagliato del seguente contenuto estratto da un gruppo Skool.

Il contenuto include lezioni, post, discussioni e materiale educativo. Il tuo compito è:

1. Creare un riassunto completo che catturi tutti i concetti principali
2. Identificare i punti chiave e le lezioni più importanti
3. Organizzare le informazioni in modo logico e strutturato
4. Evidenziare insights pratici e actionable

Contenuto da analizzare:

${truncatedContent}

Fornisci la risposta in formato JSON con questa struttura:
{
  "summary": "Riassunto completo e dettagliato (almeno 500 parole)",
  "key_points": ["punto chiave 1", "punto chiave 2", ...],
  "topics": ["topic 1", "topic 2", ...],
  "practical_insights": ["insight 1", "insight 2", ...]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sei un esperto analista che crea riassunti dettagliati e strutturati di contenuti educativi.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      ...result,
      tokens_used: response.usage.total_tokens,
    };
  } catch (error) {
    console.error('AI summary generation error:', error);
    throw new Error(`Summary generation failed: ${error.message}`);
  }
}

export async function generateReport(scrapedData, summaryData) {
  try {
    const prompt = `Genera un report dettagliato basato sui seguenti dati:

RIASSUNTO:
${summaryData.summary}

PUNTI CHIAVE:
${summaryData.key_points?.join('\n') || 'N/A'}

TOPICS:
${summaryData.topics?.join(', ') || 'N/A'}

Il report deve includere:
1. Executive Summary
2. Analisi dettagliata dei contenuti
3. Raccomandazioni pratiche
4. Conclusioni

Numero totale di items analizzati: ${scrapedData.length}

Crea un report professionale, ben strutturato e completo.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sei un consulente professionista che crea report dettagliati.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    return {
      success: true,
      report: response.choices[0].message.content,
      tokens_used: response.usage.total_tokens,
    };
  } catch (error) {
    console.error('AI report generation error:', error);
    throw new Error(`Report generation failed: ${error.message}`);
  }
}

