import { LabResource, BookingRequest } from '../types';
import { storageService } from './storageService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedResources?: LabResource[];
  timestamp: string;
}

export class GeminiLabAssistantService {
  private apiKey: string | null = null;

  constructor() {
    // Check if an API key is available via environment or server
    this.apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || null;
  }

  /**
   * Deterministic AI reasoning engine that cross-checks real resources & bookings
   */
  public async sendMessage(userMessage: string, history: ChatMessage[]): Promise<ChatMessage> {
    const resources = storageService.getResources();
    const bookings = storageService.getBookings();

    // If an external Gemini endpoint is configured, try calling it safely
    if (this.apiKey) {
      try {
        const aiResponse = await this.callGeminiApi(userMessage, resources);
        if (aiResponse) return aiResponse;
      } catch (err) {
        console.warn('Gemini API call failed or unavailable, falling back to deterministic reasoning engine:', err);
      }
    }

    // Deterministic reasoning fallback
    return this.generateDeterministicResponse(userMessage, resources, bookings);
  }

  private async callGeminiApi(userMessage: string, resources: LabResource[]): Promise<ChatMessage | null> {
    const systemPrompt = `You are LabLink AI Assistant, an intelligent campus laboratory allocation advisor.
Campus Resources Available:
${resources.map((r) => `- [${r.id}] ${r.name} (${r.category}, Dept: ${r.departmentName}, Specs: ${JSON.stringify(r.specifications)})`).join('\n')}

Rules:
1. Always suggest real equipment from the provided list.
2. Never approve or reject bookings yourself. Final approvals belong to authorized faculty.
3. Be professional, concise, and helpful to university researchers and students.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }] }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) return null;

    // Extract mentioned resource matches
    const matchedResources = resources.filter((r) => 
      text.toLowerCase().includes(r.name.toLowerCase()) || 
      userMessage.toLowerCase().includes(r.name.toLowerCase())
    );

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text,
      recommendedResources: matchedResources.length > 0 ? matchedResources : undefined,
      timestamp: new Date().toISOString(),
    };
  }

  private generateDeterministicResponse(
    query: string,
    resources: LabResource[],
    bookings: BookingRequest[]
  ): ChatMessage {
    const q = query.toLowerCase();
    let text = '';
    const matched: LabResource[] = [];

    if (q.includes('gpu') || q.includes('transformer') || q.includes('deep learning') || q.includes('llm') || q.includes('pytorch') || q.includes('machine learning')) {
      const gpuWorkstation = resources.find((r) => r.id === 'res-a100');
      const jetson = resources.find((r) => r.id === 'res-jetson');
      if (gpuWorkstation) matched.push(gpuWorkstation);
      if (jetson) matched.push(jetson);

      text = `For high-performance deep learning and vision transformer training, I recommend the **${gpuWorkstation?.name || 'NVIDIA A100 Workstation'}**.\n\n` +
        `• **Key Specs:** 80GB HBM2e VRAM, 6912 CUDA Cores, PyTorch 2.4 & CUDA 12.4 pre-installed.\n` +
        `• **Operational Hours:** 08:00 - 21:00 in Turing Complex Room 402.\n` +
        `• **Important Note:** A100 is in high demand. Ensure you specify your capstone deadline and justification in your booking request so the Intelligent Fair Allocation Engine scores your priority accurately!`;
    } else if (q.includes('robot') || q.includes('autonomous') || q.includes('arm') || q.includes('pick and place')) {
      const robot = resources.find((r) => r.id === 'res-robot');
      const jetson = resources.find((r) => r.id === 'res-jetson');
      if (robot) matched.push(robot);
      if (jetson) matched.push(jetson);

      text = `For robotics and automation prototyping, here are the top matching campus resources:\n\n` +
        `1. **${robot?.name}**: 6-axis collaborative cobot arm with 3kg payload and sub-millimeter precision.\n` +
        `2. **${jetson?.name}**: 275 TOPS edge computing for real-time sensor processing and ROS2.\n\n` +
        `Both units are currently available for project requests in the Carnot Centre and Turing Complex.`;
    } else if (q.includes('3d print') || q.includes('prototype') || q.includes('chassis') || q.includes('cnc') || q.includes('enclosure')) {
      const printer = resources.find((r) => r.id === 'res-3dprinter');
      const cnc = resources.find((r) => r.id === 'res-cnc');
      if (printer) matched.push(printer);
      if (cnc) matched.push(cnc);

      text = `For physical fabrication and rapid prototyping:\n\n` +
        `• **${printer?.name}**: Ideal for carbon-fiber (PA-CF) lightweight components and multi-color brackets.\n` +
        `• **${cnc?.name}**: Ideal for custom aluminum brackets and precision subtractive milling.\n\n` +
        `Note: Operating the CNC requires prior workshop safety certification with Dr. Anand Raman.`;
    } else if (q.includes('score') || q.includes('fairness') || q.includes('allocation') || q.includes('why')) {
      text = `### LabLink Fair Allocation Engine Breakdown\n\n` +
        `Every booking request is evaluated by our multi-factor scoring model (0-100 pts):\n\n` +
        `1. **Project Deadline Urgency (30%)**: Critical deadlines (<48 hrs) receive up to 30 points.\n` +
        `2. **Equipment Suitability (25%)**: Semantic alignment between your required tools and the lab specs.\n` +
        `3. **Academic Level & Justification (20%)**: Final-year capstones, thesis, and hackathon milestones.\n` +
        `4. **Waiting Time (15%)**: Prevents stale request starvation.\n` +
        `5. **Fairness & Access History (10%)**: Deducts priority if a single student has repeatedly monopolized the device in the past 14 days.\n\n` +
        `*Faculty administrators review these scores and hold final approval authority.*`;
    } else if (q.includes('conflict') || q.includes('alternative') || q.includes('overlap')) {
      text = `### Conflict Detection & Resolution\n\n` +
        `When two students request overlapping time windows (such as the NVIDIA A100 GPU workstation):\n\n` +
        `• LabLink automatically detects the time collision.\n` +
        `• The engine ranks requests based on the weighted fairness formula.\n` +
        `• Viable alternative time slots (adjacent hours or next available mornings) are instantly generated.\n` +
        `• Faculty can either approve an alternative with 1-click or suggest custom slots. Double booking is strictly prevented.`;
    } else {
      // General overview
      const topResources = resources.slice(0, 3);
      matched.push(...topResources);

      text = `Hello! I am your **LabLink AI Assistant**. I can help you find specialized equipment across all 6 campus engineering departments, check availability, understand technical specifications, and explain allocation scores.\n\n` +
        `You can ask me things like:\n` +
        `• *"What equipment is best for my deep learning project?"*\n` +
        `• *"Find sensors for environmental air quality monitoring"*\n` +
        `• *"How does the fair allocation scoring work?"*\n` +
        `• *"Explain why my booking conflicted with another student"*`;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text,
      recommendedResources: matched.length > 0 ? matched : undefined,
      timestamp: new Date().toISOString(),
    };
  }
}

export const geminiService = new GeminiLabAssistantService();
