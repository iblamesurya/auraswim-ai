import React, { useState, useEffect } from 'react'
import { Key, Check, AlertTriangle, X, Cpu, RefreshCw } from 'lucide-react'
import {
  getStoredApiKey,
  saveStoredApiKey,
  getStoredModel,
  saveStoredModel,
  DEFAULT_MODELS,
  DEFAULT_KEY,
  queryLiveSwimmingAI,
} from '../../lib/ai/proAIService'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('')
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODELS[0].id)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey())
      setSelectedModel(getStoredModel())
      setTestStatus('idle')
      setErrorMessage('')
      setSavedSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    saveStoredApiKey(apiKey)
    saveStoredModel(selectedModel)
    setSavedSuccess(true)
    setTimeout(() => {
      setSavedSuccess(false)
      onClose()
    }, 800)
  }

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestStatus('error')
      setErrorMessage('Please enter an authorization key first.')
      return
    }

    saveStoredApiKey(apiKey)
    saveStoredModel(selectedModel)
    setTestStatus('testing')
    setErrorMessage('')

    try {
      const res = await queryLiveSwimmingAI('Say OK for swim biomechanics connection verification')
      if (res && res.text) {
        setTestStatus('success')
      } else {
        throw new Error('No response content returned.')
      }
    } catch (err: unknown) {
      setTestStatus('error')
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(msg)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-neutral-950 border border-white/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              AuraSwim Olympic Intelligence Engine Settings
            </h3>
            <p className="text-xs text-neutral-400">
              High-Precision Swimming Biomechanics & Physiological Neural Network
            </p>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block">
            Engine Authorization Key
          </label>
          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="LLM_... or key"
              className="w-full bg-black border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-white font-mono"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Encrypted Edge Storage & Cloudflare Sync</span>
            <button
              type="button"
              onClick={() => setApiKey(DEFAULT_KEY)}
              className="underline text-neutral-300 hover:text-white"
            >
              Reset to Default Key
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 block">
            Biomechanical Model & Edge Route
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-black border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
          >
            {DEFAULT_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-neutral-950 text-white">
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Feedback */}
        {testStatus === 'testing' && (
          <div className="p-3 rounded-xl bg-neutral-900 border border-white/10 flex items-center gap-2 text-xs text-neutral-300 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Verifying neural edge connectivity...</span>
          </div>
        )}
        {testStatus === 'success' && (
          <div className="p-3 rounded-xl bg-black border border-white text-xs text-white flex items-center gap-2 font-mono">
            <Check className="w-4 h-4 text-white" />
            <span>Connection verified! AuraSwim Engine is fully operational.</span>
          </div>
        )}
        {testStatus === 'error' && (
          <div className="p-3 rounded-xl bg-neutral-900 border border-white/30 text-xs text-white flex items-start gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Connection Verification Failed</span>
              <p className="text-[11px] text-neutral-400 break-words">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/20 hover:border-white text-neutral-200 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Test Edge Connection</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{savedSuccess ? 'Saved!' : 'Save & Close'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
