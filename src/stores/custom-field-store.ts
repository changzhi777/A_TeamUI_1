/**
 * custom-field-store
 *
 * @author 外星动物（常智）IoTchange
 * @email 14455975@qq.com
 * @copyright ©2026 IoTchange
 * @version V0.1.0
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CustomFieldConfig, CustomFieldType, CustomFieldValue } from '@/lib/types/api'

// Generate unique ID
const generateId = () => `cf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Default global custom fields (examples)
const DEFAULT_GLOBAL_FIELDS: CustomFieldConfig[] = [
  // No default fields - users can add their own
]

interface CustomFieldState {
  // Data
  fields: CustomFieldConfig[]
  isLoading: boolean
  error: string | null

  // CRUD operations
  createField: (data: Omit<CustomFieldConfig, 'id' | 'createdAt' | 'updatedAt'>) => CustomFieldConfig
  updateField: (id: string, updates: Partial<Omit<CustomFieldConfig, 'id' | 'createdAt'>>) => void
  deleteField: (id: string) => void
  getFieldById: (id: string) => CustomFieldConfig | undefined

  // Query operations
  getGlobalFields: () => CustomFieldConfig[]
  getProjectFields: (projectId: string) => CustomFieldConfig[]
  getMergedFields: (projectId: string) => CustomFieldConfig[]
  getVisibleFields: (projectId: string) => CustomFieldConfig[]

  // Batch operations
  reorderFields: (fieldIds: string[], projectId?: string) => void
  duplicateField: (id: string, projectId?: string) => CustomFieldConfig | null

  // Reset
  resetToDefaults: () => void
}

export const useCustomFieldStore = create<CustomFieldState>()(
  persist(
    (set, get) => ({
      // Initial state
      fields: DEFAULT_GLOBAL_FIELDS,
      isLoading: false,
      error: null,

      // Create a new field
      createField: (data) => {
        const now = new Date().toISOString()
        const newField: CustomFieldConfig = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          fields: [...state.fields, newField],
        }))

        return newField
      },

      // Update an existing field
      updateField: (id, updates) => {
        set((state) => ({
          fields: state.fields.map((field) =>
            field.id === id
              ? { ...field, ...updates, updatedAt: new Date().toISOString() }
              : field
          ),
        }))
      },

      // Delete a field
      deleteField: (id) => {
        set((state) => ({
          fields: state.fields.filter((field) => field.id !== id),
        }))
      },

      // Get field by ID
      getFieldById: (id) => {
        return get().fields.find((field) => field.id === id)
      },

      // Get global fields (no projectId)
      getGlobalFields: () => {
        return get()
          .fields.filter((field) => field.projectId === undefined)
          .sort((a, b) => a.order - b.order)
      },

      // Get project-specific fields
      getProjectFields: (projectId) => {
        return get()
          .fields.filter((field) => field.projectId === projectId)
          .sort((a, b) => a.order - b.order)
      },

      // Get merged fields (global + project-specific, with project fields overriding global)
      getMergedFields: (projectId) => {
        const globalFields = get().getGlobalFields()
        const projectFields = get().getProjectFields(projectId)

        // Create a map for quick lookup
        const fieldMap = new Map<string, CustomFieldConfig>()

        // Add global fields first
        globalFields.forEach((field) => {
          fieldMap.set(field.id, field)
        })

        // Override with project fields (by id) or add new project fields
        projectFields.forEach((field) => {
          fieldMap.set(field.id, field)
        })

        // Sort by order
        return Array.from(fieldMap.values()).sort((a, b) => a.order - b.order)
      },

      // Get only visible merged fields
      getVisibleFields: (projectId) => {
        return get()
          .getMergedFields(projectId)
          .filter((field) => field.visible)
      },

      // Reorder fields
      reorderFields: (fieldIds, projectId) => {
        set((state) => {
          const updatedFields = state.fields.map((field) => {
            // Only update fields that belong to the specified scope
            const isInScope =
              projectId === undefined
                ? field.projectId === undefined
                : field.projectId === projectId

            if (!isInScope) return field

            const newOrder = fieldIds.indexOf(field.id)
            if (newOrder === -1) return field

            return { ...field, order: newOrder }
          })

          return { fields: updatedFields }
        })
      },

      // Duplicate a field
      duplicateField: (id, projectId) => {
        const original = get().getFieldById(id)
        if (!original) return null

        const now = new Date().toISOString()
        const newField: CustomFieldConfig = {
          ...original,
          id: generateId(),
          name: `${original.name} (副本)`,
          projectId: projectId ?? original.projectId,
          order: get().fields.filter((f) =>
            projectId === undefined ? f.projectId === undefined : f.projectId === projectId
          ).length,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          fields: [...state.fields, newField],
        }))

        return newField
      },

      // Reset to defaults
      resetToDefaults: () => {
        set({ fields: DEFAULT_GLOBAL_FIELDS })
      },
    }),
    {
      name: 'custom-field-storage',
      partialize: (state) => ({
        fields: state.fields,
      }),
    }
  )
)

// Helper functions for field type validation
export function validateFieldValue(
  type: CustomFieldType,
  value: unknown
): value is CustomFieldValue {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'date':
      return typeof value === 'string' || value === null
    case 'number':
      return typeof value === 'number' || value === null
    case 'checkbox':
      return typeof value === 'boolean' || value === null
    case 'select':
      return typeof value === 'string' || value === null
    case 'multiselect':
      return Array.isArray(value) || value === null
    default:
      return false
  }
}

// Get default value for a field type
export function getDefaultValueForType(type: CustomFieldType): CustomFieldValue {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'date':
    case 'select':
      return ''
    case 'number':
      return 0
    case 'checkbox':
      return false
    case 'multiselect':
      return []
    default:
      return null
  }
}

// Format field value for display
export function formatFieldValue(
  value: CustomFieldValue,
  field: CustomFieldConfig
): string {
  if (value === null || value === undefined) return ''

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'date':
      return String(value)
    case 'number':
      return String(value)
    case 'checkbox':
      return value ? '是' : '否'
    case 'select':
      // Display the option label, not the value
      if (field.options && typeof value === 'string') {
        const index = parseInt(value, 10)
        return field.options[index] || String(value)
      }
      return String(value)
    case 'multiselect':
      if (Array.isArray(value) && field.options) {
        return value
          .map((v) => {
            const index = parseInt(v, 10)
            return field.options[index] || v
          })
          .join(', ')
      }
      return Array.isArray(value) ? value.join(', ') : ''
    default:
      return String(value)
  }
}
