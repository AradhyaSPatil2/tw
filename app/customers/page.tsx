"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Phone, Mail, MapPin, Calendar, FileText, User, Building, DollarSign, Edit } from "lucide-react"
import Layout from "@/components/layout"
import ExportButton from "@/components/export-button"
import MeetingModal from "@/components/meeting-modal"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: "active" | "inactive" | "prospect" | "client" | "former-client"
  value: number
  lastContact: string
  address: string
  notes: string
  interactions: Interaction[]
  products: Product[]
  serviceRequests: ServiceRequest[]
  documents: Document[]
}

interface Interaction {
  id: string
  type: "call" | "email" | "meeting" | "note"
  date: string
  description: string
  outcome: string
}

interface Product {
  id: string
  name: string
  status: "purchased" | "interested" | "declined"
  value: number
  date: string
}

interface ServiceRequest {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  createdDate: string
}

interface Document {
  id: string
  name: string
  type: string
  uploadDate: string
  size: string
}

interface CustomerProduct {
  id: string
  customerId: string
  customerName: string
  productId: string
  productName: string
  category: string
  purchaseDate: string
  amount: number
  status: "active" | "inactive" | "pending" | "cancelled"
  advisor?: string
  notes: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditingValue, setIsEditingValue] = useState(false)
  const [editValue, setEditValue] = useState("")
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false)
  const [isAddServiceRequestOpen, setIsAddServiceRequestOpen] = useState(false)
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<CustomerProduct | null>(null)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: "",
  })
  const [newInteraction, setNewInteraction] = useState({
    type: "call" as Interaction["type"],
    description: "",
    outcome: "",
  })
  const [newServiceRequest, setNewServiceRequest] = useState({
    title: "",
    description: "",
    priority: "medium" as ServiceRequest["priority"],
  })

  useEffect(() => {
    const savedCustomers = localStorage.getItem("customers")
    const savedCustomerProducts = localStorage.getItem("customerProducts")

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    }
    if (savedCustomerProducts) {
      setCustomerProducts(JSON.parse(savedCustomerProducts))
    }
  }, [])

  const saveCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers)
    localStorage.setItem("customers", JSON.stringify(updatedCustomers))
  }

  const saveCustomerProducts = (updatedCustomerProducts: CustomerProduct[]) => {
    setCustomerProducts(updatedCustomerProducts)
    localStorage.setItem("customerProducts", JSON.stringify(updatedCustomerProducts))
  }

  const addCustomer = () => {
    if (newCustomer.name && newCustomer.email) {
      const customer: Customer = {
        id: Date.now().toString(),
        ...newCustomer,
        status: "prospect",
        value: 0,
        lastContact: new Date().toISOString().split("T")[0],
        interactions: [],
        products: [],
        serviceRequests: [],
        documents: [],
      }

      const updatedCustomers = [...customers, customer]
      saveCustomers(updatedCustomers)

      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        notes: "",
      })
      setIsAddCustomerOpen(false)
    }
  }

  const updateCustomerValue = () => {
    if (selectedCustomer && editValue !== "") {
      const updatedCustomers = customers.map((customer) =>
        customer.id === selectedCustomer.id ? { ...customer, value: Number.parseFloat(editValue) || 0 } : customer,
      )
      saveCustomers(updatedCustomers)
      setSelectedCustomer({ ...selectedCustomer, value: Number.parseFloat(editValue) || 0 })
      setIsEditingValue(false)
      setEditValue("")
    }
  }

  const updateCustomerStatus = (customerId: string, newStatus: Customer["status"]) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === customerId ? { ...customer, status: newStatus } : customer,
    )
    saveCustomers(updatedCustomers)
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer({ ...selectedCustomer, status: newStatus })
    }
  }

  const addInteraction = () => {
    if (selectedCustomer && newInteraction.description) {
      const interaction: Interaction = {
        id: Date.now().toString(),
        ...newInteraction,
        date: new Date().toISOString().split("T")[0],
      }

      const updatedCustomers = customers.map((customer) => {
        if (customer.id === selectedCustomer.id) {
          return {
            ...customer,
            interactions: [...customer.interactions, interaction],
            lastContact: new Date().toISOString().split("T")[0],
          }
        }
        return customer
      })

      saveCustomers(updatedCustomers)
      setSelectedCustomer({
        ...selectedCustomer,
        interactions: [...selectedCustomer.interactions, interaction],
        lastContact: new Date().toISOString().split("T")[0],
      })

      setNewInteraction({
        type: "call",
        description: "",
        outcome: "",
      })
      setIsAddInteractionOpen(false)
    }
  }

  const addServiceRequest = () => {
    if (selectedCustomer && newServiceRequest.title && newServiceRequest.description) {
      const request: ServiceRequest = {
        id: Date.now().toString(),
        ...newServiceRequest,
        status: "open",
        createdDate: new Date().toISOString().split("T")[0],
      }

      const updatedCustomers = customers.map((customer) => {
        if (customer.id === selectedCustomer.id) {
          return {
            ...customer,
            serviceRequests: [...customer.serviceRequests, request],
          }
        }
        return customer
      })

      saveCustomers(updatedCustomers)
      setSelectedCustomer({
        ...selectedCustomer,
        serviceRequests: [...selectedCustomer.serviceRequests, request],
      })

      setNewServiceRequest({
        title: "",
        description: "",
        priority: "medium",
      })
      setIsAddServiceRequestOpen(false)
    }
  }

  const updateProduct = () => {
    if (editingProduct) {
      const updatedCustomerProducts = customerProducts.map((cp) => (cp.id === editingProduct.id ? editingProduct : cp))
      saveCustomerProducts(updatedCustomerProducts)
      setIsEditProductOpen(false)
      setEditingProduct(null)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#d7af00] text-white"
      case "inactive":
        return "bg-gray-500 text-white"
      case "prospect":
        return "bg-[#008dd2] text-white"
      case "client":
        return "bg-[#ef7f1a] text-white"
      case "former-client":
        return "bg-[#fecc00] text-black"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[#d7af00] text-white"
      case "inactive":
        return "bg-gray-500 text-white"
      case "pending":
        return "bg-[#008dd2] text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  // Get customer products for selected customer
  const selectedCustomerProducts = selectedCustomer
    ? customerProducts.filter((cp) => cp.customerId === selectedCustomer.id)
    : []

  // Export headers for customers
  const customerExportHeaders = [
    "name",
    "email",
    "phone",
    "company",
    "status",
    "value",
    "lastContact",
    "address",
    "notes",
  ]

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#004360]">Customer 360</h1>
          <div className="flex gap-2">
            <ExportButton data={customers} filename="customers" headers={customerExportHeaders} />
            <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#004360]">Add New Customer</DialogTitle>
                  <DialogDescription>Enter customer information to create a new customer profile.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-[#004360]">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      placeholder="Customer name"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-[#004360]">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="customer@example.com"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-[#004360]">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      placeholder="Phone number"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-[#004360]">
                      Company
                    </Label>
                    <Input
                      id="company"
                      value={newCustomer.company}
                      onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
                      placeholder="Company name"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-[#004360]">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      placeholder="Customer address"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes" className="text-[#004360]">
                      Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                      placeholder="Additional notes"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={addCustomer}
                      className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                      disabled={!newCustomer.name || !newCustomer.email}
                    >
                      Add Customer
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddCustomerOpen(false)}
                      className="flex-1 border-[#004360] text-[#004360]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#004360] flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customers
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-[#008dd2] focus:border-[#004360]"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No customers found</p>
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedCustomer?.id === customer.id ? "bg-blue-50 border-l-4 border-l-[#008dd2]" : ""
                        }`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-[#004360]">{customer.name}</h4>
                          <Badge className={getStatusColor(customer.status)}>{customer.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{customer.email}</p>
                        <p className="text-sm text-gray-500">{customer.company}</p>
                        <p className="text-xs text-gray-400 mt-1">Last contact: {customer.lastContact}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer 360 View */}
          <div className="lg:col-span-2">
            {selectedCustomer ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#004360] rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-[#004360]">{selectedCustomer.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedCustomer.email}
                        </span>
                        {selectedCustomer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {selectedCustomer.phone}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setIsMeetingModalOpen(true)}
                        className="bg-[#008dd2] hover:bg-[#006ba6] text-white"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Schedule Meeting
                      </Button>
                      <Select
                        value={selectedCustomer.status}
                        onValueChange={(value) =>
                          updateCustomerStatus(selectedCustomer.id, value as Customer["status"])
                        }
                      >
                        <SelectTrigger className="w-32 border-[#004360]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                          <SelectItem value="former-client">Former Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="interactions">Interactions</TabsTrigger>
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="service">Service</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Company Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium">{selectedCustomer.company || "Not specified"}</p>
                            {selectedCustomer.address && (
                              <p className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                {selectedCustomer.address}
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Account Value
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIsEditingValue(true)
                                  setEditValue(selectedCustomer.value.toString())
                                }}
                                className="ml-auto p-1 h-6 w-6"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {isEditingValue ? (
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button size="sm" onClick={updateCustomerValue} className="bg-[#d7af00] text-white">
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setIsEditingValue(false)
                                    setEditValue("")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                <p className="text-2xl font-bold text-[#d7af00]">
                                  ₹{selectedCustomer.value.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">Total customer value</p>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium text-gray-600">Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedCustomer.interactions.length === 0 ? (
                            <p className="text-gray-500">No recent activity</p>
                          ) : (
                            <div className="space-y-2">
                              {selectedCustomer.interactions.slice(0, 3).map((interaction) => (
                                <div key={interaction.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                  <Calendar className="h-4 w-4 text-[#008dd2]" />
                                  <div>
                                    <p className="text-sm font-medium capitalize">{interaction.type}</p>
                                    <p className="text-xs text-gray-600">{interaction.date}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="interactions" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-[#004360]">Interaction History</h3>
                        <Dialog open={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white">
                              <Plus className="h-4 w-4 mr-1" />
                              Add Interaction
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-[#004360]">Add New Interaction</DialogTitle>
                              <DialogDescription>Record a new interaction with this customer.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-[#004360]">Interaction Type</Label>
                                <Select
                                  value={newInteraction.type}
                                  onValueChange={(value) =>
                                    setNewInteraction({ ...newInteraction, type: value as Interaction["type"] })
                                  }
                                >
                                  <SelectTrigger className="border-[#004360]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="call">Phone Call</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="note">Note</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="description" className="text-[#004360]">
                                  Description *
                                </Label>
                                <Textarea
                                  id="description"
                                  value={newInteraction.description}
                                  onChange={(e) =>
                                    setNewInteraction({ ...newInteraction, description: e.target.value })
                                  }
                                  placeholder="Describe the interaction"
                                  className="border-[#004360]"
                                />
                              </div>
                              <div>
                                <Label htmlFor="outcome" className="text-[#004360]">
                                  Outcome
                                </Label>
                                <Input
                                  id="outcome"
                                  value={newInteraction.outcome}
                                  onChange={(e) => setNewInteraction({ ...newInteraction, outcome: e.target.value })}
                                  placeholder="Interaction outcome"
                                  className="border-[#004360]"
                                />
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={addInteraction}
                                  className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                                  disabled={!newInteraction.description}
                                >
                                  Add Interaction
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsAddInteractionOpen(false)}
                                  className="flex-1 border-[#004360] text-[#004360]"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {selectedCustomer.interactions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No interactions recorded</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedCustomer.interactions.map((interaction) => (
                            <Card key={interaction.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <Badge variant="outline" className="capitalize">
                                    {interaction.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">{interaction.date}</span>
                                </div>
                                <p className="text-sm">{interaction.description}</p>
                                {interaction.outcome && (
                                  <p className="text-xs text-gray-600 mt-1">Outcome: {interaction.outcome}</p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="products" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-[#004360]">Products & Services</h3>
                      </div>

                      {selectedCustomerProducts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No products or services assigned</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedCustomerProducts.map((product) => (
                            <Card key={product.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-medium">{product.productName}</h4>
                                    <p className="text-sm text-gray-600">{product.category}</p>
                                    <p className="text-sm font-medium text-[#d7af00]">
                                      ₹{product.amount.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">Purchase Date: {product.purchaseDate}</p>
                                    {product.advisor && (
                                      <p className="text-xs text-gray-500">Advisor: {product.advisor}</p>
                                    )}
                                    {product.notes && <p className="text-xs text-gray-600 mt-1">{product.notes}</p>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={getProductStatusColor(product.status)}>{product.status}</Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingProduct(product)
                                        setIsEditProductOpen(true)
                                      }}
                                      className="text-[#004360] hover:bg-gray-100 p-1"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="service" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-[#004360]">Service Requests</h3>
                        <Dialog open={isAddServiceRequestOpen} onOpenChange={setIsAddServiceRequestOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white">
                              <Plus className="h-4 w-4 mr-1" />
                              New Request
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-[#004360]">Add Service Request</DialogTitle>
                              <DialogDescription>Create a new service request for this customer.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="requestTitle" className="text-[#004360]">
                                  Title *
                                </Label>
                                <Input
                                  id="requestTitle"
                                  value={newServiceRequest.title}
                                  onChange={(e) =>
                                    setNewServiceRequest({ ...newServiceRequest, title: e.target.value })
                                  }
                                  placeholder="Service request title"
                                  className="border-[#004360]"
                                />
                              </div>
                              <div>
                                <Label htmlFor="requestDescription" className="text-[#004360]">
                                  Description *
                                </Label>
                                <Textarea
                                  id="requestDescription"
                                  value={newServiceRequest.description}
                                  onChange={(e) =>
                                    setNewServiceRequest({ ...newServiceRequest, description: e.target.value })
                                  }
                                  placeholder="Describe the service request"
                                  className="border-[#004360]"
                                />
                              </div>
                              <div>
                                <Label className="text-[#004360]">Priority</Label>
                                <Select
                                  value={newServiceRequest.priority}
                                  onValueChange={(value) =>
                                    setNewServiceRequest({
                                      ...newServiceRequest,
                                      priority: value as ServiceRequest["priority"],
                                    })
                                  }
                                >
                                  <SelectTrigger className="border-[#004360]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={addServiceRequest}
                                  className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                                  disabled={!newServiceRequest.title || !newServiceRequest.description}
                                >
                                  Create Request
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsAddServiceRequestOpen(false)}
                                  className="flex-1 border-[#004360] text-[#004360]"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {selectedCustomer.serviceRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No service requests</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedCustomer.serviceRequests.map((request) => (
                            <Card key={request.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium">{request.title}</h4>
                                  <div className="flex gap-2">
                                    <Badge
                                      className={
                                        request.priority === "high"
                                          ? "bg-[#ef7f1a] text-white"
                                          : request.priority === "medium"
                                            ? "bg-[#fecc00] text-black"
                                            : "bg-gray-500 text-white"
                                      }
                                    >
                                      {request.priority}
                                    </Badge>
                                    <Badge variant="outline">{request.status}</Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">{request.description}</p>
                                <p className="text-xs text-gray-500 mt-1">Created: {request.createdDate}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="notes" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-[#004360]">Customer Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Textarea
                            value={selectedCustomer.notes}
                            onChange={(e) => {
                              const updatedCustomers = customers.map((customer) =>
                                customer.id === selectedCustomer.id ? { ...customer, notes: e.target.value } : customer,
                              )
                              saveCustomers(updatedCustomers)
                              setSelectedCustomer({ ...selectedCustomer, notes: e.target.value })
                            }}
                            placeholder="Add notes about this customer..."
                            className="min-h-32 border-[#004360] focus:border-[#008dd2]"
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-[#004360]">Documents</h3>
                        <Button size="sm" className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white">
                          <Plus className="h-4 w-4 mr-1" />
                          Upload Document
                        </Button>
                      </div>

                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No documents uploaded</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select a Customer</h3>
                    <p>Choose a customer from the list to view their 360° profile</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Meeting Modal */}
        <MeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
          selectedCustomer={selectedCustomer}
        />

        {/* Edit Product Modal */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#004360]">Edit Product Assignment</DialogTitle>
              <DialogDescription>Update product/service details for this customer.</DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div>
                  <Label className="text-[#004360]">Product/Service</Label>
                  <Input value={editingProduct.productName} className="border-[#004360] bg-gray-50" disabled />
                </div>
                <div>
                  <Label htmlFor="editPurchaseDate" className="text-[#004360]">
                    Purchase Date
                  </Label>
                  <Input
                    id="editPurchaseDate"
                    type="date"
                    value={editingProduct.purchaseDate}
                    onChange={(e) => setEditingProduct({ ...editingProduct, purchaseDate: e.target.value })}
                    className="border-[#004360]"
                  />
                </div>
                <div>
                  <Label htmlFor="editAmount" className="text-[#004360]">
                    Amount (₹)
                  </Label>
                  <Input
                    id="editAmount"
                    type="number"
                    value={editingProduct.amount}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, amount: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="border-[#004360]"
                  />
                </div>
                <div>
                  <Label className="text-[#004360]">Status</Label>
                  <Select
                    value={editingProduct.status}
                    onValueChange={(value) => setEditingProduct({ ...editingProduct, status: value as any })}
                  >
                    <SelectTrigger className="border-[#004360]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editAdvisor" className="text-[#004360]">
                    Advisor
                  </Label>
                  <Input
                    id="editAdvisor"
                    value={editingProduct.advisor || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, advisor: e.target.value })}
                    placeholder="Assigned advisor"
                    className="border-[#004360]"
                  />
                </div>
                <div>
                  <Label htmlFor="editNotes" className="text-[#004360]">
                    Notes
                  </Label>
                  <Textarea
                    id="editNotes"
                    value={editingProduct.notes}
                    onChange={(e) => setEditingProduct({ ...editingProduct, notes: e.target.value })}
                    placeholder="Additional notes"
                    className="border-[#004360]"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={updateProduct} className="flex-1 bg-[#d7af00] text-white">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditProductOpen(false)
                      setEditingProduct(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
