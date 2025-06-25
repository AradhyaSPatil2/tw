"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Package, Users, TrendingUp, BarChart3, Filter, Edit, ArrowLeft } from "lucide-react"
import Layout from "@/components/layout"
import ExportButton from "@/components/export-button"

interface Product {
  id: string
  name: string
  category: string
  subcategory: string
  description: string
  isActive: boolean
  createdDate: string
  lastUpdated: string
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

const productCategories = {
  "Thynk Investment": {
    Equity: ["Stocks", "ETFs"],
    "Mutual Funds": ["Equity Funds", "Debt Funds", "Hybrid Funds"],
    PMS: ["Portfolio Management Services"],
    "Fixed Assets": ["Bonds", "Fixed Deposits"],
  },
  "Thynk LiveMarkets": {
    "Intraday Trading": ["Day Trading", "Scalping"],
    "Swing Trading": ["Short Term", "Medium Term"],
    "Futures & Options": ["Futures", "Options", "Derivatives"],
  },
  "Thynk Insurance": {
    "Life Insurance": ["Term Life", "Whole Life", "ULIP"],
    "Health Insurance": ["Individual Health", "Family Health", "Critical Illness"],
    "Auto Insurance": ["Car Insurance", "Two Wheeler Insurance"],
    "General Insurance": ["Home Insurance", "Travel Insurance", "Personal Accident"],
  },
  "Thynk Advisory": {
    "Risk Assessment": ["Risk Profiling", "Portfolio Analysis"],
    "Wealth Goals": ["Goal Planning", "Investment Strategy"],
    "Retirement Plans": ["Pension Plans", "Retirement Corpus"],
  },
  "Thynk Loans": {
    "Home Loans": ["Home Purchase", "Home Construction", "Plot Purchase"],
    "Auto Loans": ["Car Loans", "Two Wheeler Loans"],
    "Credit Cards": ["Lifestyle Cards", "Cashback Cards", "Travel Cards"],
  },
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [customerProducts, setCustomerProducts] = useState<CustomerProduct[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isAddToCustomerOpen, setIsAddToCustomerOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<CustomerProduct | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    customerId: "",
    purchaseDate: "",
    amount: "",
    status: "active" as CustomerProduct["status"],
    advisor: "",
    notes: "",
  })

  useEffect(() => {
    // Initialize products from categories
    const initialProducts: Product[] = []
    Object.entries(productCategories).forEach(([category, subcategories]) => {
      Object.entries(subcategories).forEach(([subcategory, items]) => {
        items.forEach((item) => {
          initialProducts.push({
            id: `${category}-${subcategory}-${item}`.replace(/\s+/g, "-").toLowerCase(),
            name: item,
            category,
            subcategory,
            description: `${item} under ${subcategory} category`,
            isActive: true,
            createdDate: "2024-01-01",
            lastUpdated: "2024-12-20",
          })
        })
      })
    })
    setProducts(initialProducts)

    // Load customer products and customers
    const savedCustomerProducts = localStorage.getItem("customerProducts")
    const savedCustomers = localStorage.getItem("customers")

    if (savedCustomerProducts) {
      setCustomerProducts(JSON.parse(savedCustomerProducts))
    }
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    }
  }, [])

  const saveCustomerProducts = (updatedCustomerProducts: CustomerProduct[]) => {
    setCustomerProducts(updatedCustomerProducts)
    localStorage.setItem("customerProducts", JSON.stringify(updatedCustomerProducts))
  }

  const addProductToCustomer = () => {
    if (selectedProduct && newAssignment.customerId && newAssignment.purchaseDate && newAssignment.amount) {
      const customer = customers.find((c) => c.id === newAssignment.customerId)
      if (customer) {
        const assignment: CustomerProduct = {
          id: Date.now().toString(),
          customerId: newAssignment.customerId,
          customerName: customer.name,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          category: selectedProduct.category,
          purchaseDate: newAssignment.purchaseDate,
          amount: Number.parseFloat(newAssignment.amount) || 0,
          status: newAssignment.status,
          advisor: newAssignment.advisor,
          notes: newAssignment.notes,
        }

        const updatedCustomerProducts = [...customerProducts, assignment]
        saveCustomerProducts(updatedCustomerProducts)

        setNewAssignment({
          customerId: "",
          purchaseDate: "",
          amount: "",
          status: "active",
          advisor: "",
          notes: "",
        })
        setIsAddToCustomerOpen(false)
        setSelectedProduct(null)
      }
    }
  }

  const updateCustomerProduct = () => {
    if (editingProduct) {
      const updatedCustomerProducts = customerProducts.map((cp) => (cp.id === editingProduct.id ? editingProduct : cp))
      saveCustomerProducts(updatedCustomerProducts)
      setIsEditProductOpen(false)
      setEditingProduct(null)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const filteredCustomerProducts = customerProducts.filter((cp) => {
    const matchesStatus = statusFilter === "all" || cp.status === statusFilter
    return matchesStatus
  })

  const getStatusColor = (status: string) => {
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

  // Get customer assignments for selected product
  const selectedProductCustomers = selectedProduct
    ? customerProducts.filter((cp) => cp.productId === selectedProduct.id)
    : []

  // Export headers for products
  const productExportHeaders = [
    "name",
    "category",
    "subcategory",
    "description",
    "isActive",
    "createdDate",
    "lastUpdated",
  ]

  const customerProductExportHeaders = [
    "customerName",
    "productName",
    "category",
    "purchaseDate",
    "amount",
    "status",
    "advisor",
    "notes",
  ]

  if (showDetailView && selectedProduct) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDetailView(false)
                setSelectedProduct(null)
              }}
              className="text-[#004360] hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
            <h1 className="text-3xl font-bold text-[#004360]">{selectedProduct.name}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Information */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl text-[#004360]">{selectedProduct.name}</CardTitle>
                      <div className="flex items-center gap-3 mt-3">
                        <Badge className="bg-[#008dd2] text-white text-sm px-3 py-1">
                          {selectedProduct.category.replace("Thynk ", "")}
                        </Badge>
                        <Badge variant="outline" className="text-sm px-3 py-1">
                          {selectedProduct.subcategory}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsAddToCustomerOpen(true)}
                      className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white px-6 py-3 text-lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Assign to Customer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-[#004360] mb-3">Description</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-[#004360] mb-2">Category</h4>
                      <p className="text-lg text-gray-600">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-[#004360] mb-2">Subcategory</h4>
                      <p className="text-lg text-gray-600">{selectedProduct.subcategory}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#004360] mb-4">Customer Assignments</h3>
                    {selectedProductCustomers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg">No customers assigned to this product/service</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedProductCustomers.map((assignment) => (
                          <Card key={assignment.id} className="border-l-4 border-l-[#008dd2]">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="text-xl font-semibold text-[#004360] mb-2">
                                    {assignment.customerName}
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                                    <div>
                                      <span className="text-gray-600">Purchase Date:</span>
                                      <span className="ml-2 font-medium">{assignment.purchaseDate}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Amount:</span>
                                      <span className="ml-2 font-medium text-[#d7af00]">
                                        ₹{assignment.amount.toLocaleString()}
                                      </span>
                                    </div>
                                    {assignment.advisor && (
                                      <div>
                                        <span className="text-gray-600">Advisor:</span>
                                        <span className="ml-2 font-medium">{assignment.advisor}</span>
                                      </div>
                                    )}
                                  </div>
                                  {assignment.notes && (
                                    <div className="mt-3">
                                      <span className="text-gray-600">Notes:</span>
                                      <p className="mt-1 text-gray-700">{assignment.notes}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    className={getStatusColor(assignment.status)}
                                    style={{ fontSize: "14px", padding: "6px 12px" }}
                                  >
                                    {assignment.status}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingProduct(assignment)
                                      setIsEditProductOpen(true)
                                    }}
                                    className="text-[#004360] hover:bg-gray-100"
                                  >
                                    <Edit className="h-5 w-5" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-[#004360]">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-4 bg-[#008dd2]/10 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                    <p className="text-3xl font-bold text-[#008dd2]">{selectedProductCustomers.length}</p>
                  </div>
                  <div className="text-center p-4 bg-[#d7af00]/10 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-[#d7af00]">
                      ₹{selectedProductCustomers.reduce((sum, cp) => sum + cp.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-[#ef7f1a]/10 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Assignments</p>
                    <p className="text-3xl font-bold text-[#ef7f1a]">
                      {selectedProductCustomers.filter((cp) => cp.status === "active").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#004360]">Products & Services</h1>
          <ExportButton data={products} filename="products" headers={productExportHeaders} />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">All Products</TabsTrigger>
            <TabsTrigger value="assignments">Customer Assignments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-[#ef7f1a]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#ef7f1a]">{products.length}</div>
                  <p className="text-xs text-gray-500">Available services</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#008dd2]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Active Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#008dd2]">
                    {customerProducts.filter((cp) => cp.status === "active").length}
                  </div>
                  <p className="text-xs text-gray-500">Currently active</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#d7af00]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#d7af00]">{Object.keys(productCategories).length}</div>
                  <p className="text-xs text-gray-500">Service categories</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#fecc00]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#fecc00]">
                    ₹{customerProducts.reduce((sum, cp) => sum + cp.amount, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">From all assignments</p>
                </CardContent>
              </Card>
            </div>

            {/* Category Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004360]">Product Categories</CardTitle>
                  <CardDescription>Overview of all product and service categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(productCategories).map(([category, subcategories]) => {
                      const productCount = Object.values(subcategories).flat().length
                      const assignments = customerProducts.filter((cp) => cp.category === category).length
                      return (
                        <div key={category} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-[#004360]">{category}</h4>
                            <Badge variant="outline">{productCount} products</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{assignments} customer assignments</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004360]">Recent Assignments</CardTitle>
                  <CardDescription>Latest product assignments to customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {customerProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No assignments yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerProducts.slice(-5).map((assignment) => (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-[#004360]">{assignment.customerName}</p>
                            <p className="text-sm text-gray-600">{assignment.productName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#d7af00]">₹{assignment.amount.toLocaleString()}</p>
                            <Badge className={getStatusColor(assignment.status)} style={{ fontSize: "11px" }}>
                              {assignment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products and services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#008dd2] focus:border-[#004360]"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-64 border-[#008dd2] focus:border-[#004360]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(productCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-[#008dd2]"
                  onClick={() => {
                    setSelectedProduct(product)
                    setShowDetailView(true)
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-[#008dd2] text-white">{product.category.replace("Thynk ", "")}</Badge>
                      <Badge variant="outline">{product.subcategory}</Badge>
                    </div>
                    <CardTitle className="text-[#004360] text-lg leading-tight">{product.name}</CardTitle>
                    <CardDescription className="text-sm">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Assignments: {customerProducts.filter((cp) => cp.productId === product.id).length}
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProduct(product)
                          setIsAddToCustomerOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-[#008dd2] focus:border-[#004360]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <ExportButton
                data={customerProducts}
                filename="customer-products"
                headers={customerProductExportHeaders}
              />
            </div>

            {/* Assignments Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#004360]">Customer Product Assignments</CardTitle>
                <CardDescription>All product and service assignments to customers</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-[#004360]">Customer</th>
                        <th className="text-left p-4 font-medium text-[#004360]">Product/Service</th>
                        <th className="text-left p-4 font-medium text-[#004360]">Category</th>
                        <th className="text-left p-4 font-medium text-[#004360]">Amount</th>
                        <th className="text-left p-4 font-medium text-[#004360]">Purchase Date</th>
                        <th className="text-left p-4 font-medium text-[#004360]">Status</th>
                        <th className="text-left p-4 font-medium text-[#004360]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomerProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-500">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No product assignments found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredCustomerProducts.map((assignment) => (
                          <tr key={assignment.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 font-medium text-[#004360]">{assignment.customerName}</td>
                            <td className="p-4">{assignment.productName}</td>
                            <td className="p-4">
                              <Badge variant="outline">{assignment.category.replace("Thynk ", "")}</Badge>
                            </td>
                            <td className="p-4 font-medium text-[#d7af00]">₹{assignment.amount.toLocaleString()}</td>
                            <td className="p-4">{assignment.purchaseDate}</td>
                            <td className="p-4">
                              <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                            </td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingProduct(assignment)
                                  setIsEditProductOpen(true)
                                }}
                                className="text-[#004360] hover:bg-gray-100"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Average Assignment Value</p>
                    <p className="text-2xl font-bold text-[#ef7f1a]">
                      ₹
                      {customerProducts.length > 0
                        ? (
                            customerProducts.reduce((sum, cp) => sum + cp.amount, 0) / customerProducts.length
                          ).toLocaleString()
                        : 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Most Popular Category</p>
                    <p className="text-lg font-bold text-[#008dd2]">
                      {Object.keys(productCategories)
                        .reduce((prev, current) => {
                          const prevCount = customerProducts.filter((cp) => cp.category === prev).length
                          const currentCount = customerProducts.filter((cp) => cp.category === current).length
                          return currentCount > prevCount ? current : prev
                        }, Object.keys(productCategories)[0])
                        ?.replace("Thynk ", "") || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Active Rate</p>
                    <p className="text-2xl font-bold text-[#d7af00]">
                      {customerProducts.length > 0
                        ? Math.round(
                            (customerProducts.filter((cp) => cp.status === "active").length / customerProducts.length) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <p className="text-2xl font-bold text-[#fecc00]">
                      {new Set(customerProducts.map((cp) => cp.customerId)).size}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add to Customer Dialog */}
        <Dialog open={isAddToCustomerOpen} onOpenChange={setIsAddToCustomerOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#004360]">Assign Product to Customer</DialogTitle>
              <DialogDescription>Assign {selectedProduct?.name} to a customer profile.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-[#004360]">Customer *</Label>
                <Select
                  value={newAssignment.customerId}
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, customerId: value })}
                >
                  <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="purchaseDate" className="text-[#004360]">
                  Purchase Date *
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={newAssignment.purchaseDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, purchaseDate: e.target.value })}
                  className="border-[#004360] focus:border-[#008dd2]"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-[#004360]">
                  Amount (₹) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={newAssignment.amount}
                  onChange={(e) => setNewAssignment({ ...newAssignment, amount: e.target.value })}
                  placeholder="0"
                  className="border-[#004360] focus:border-[#008dd2]"
                />
              </div>
              <div>
                <Label className="text-[#004360]">Status</Label>
                <Select
                  value={newAssignment.status}
                  onValueChange={(value) =>
                    setNewAssignment({ ...newAssignment, status: value as CustomerProduct["status"] })
                  }
                >
                  <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
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
                <Label htmlFor="advisor" className="text-[#004360]">
                  Advisor (Optional)
                </Label>
                <Input
                  id="advisor"
                  value={newAssignment.advisor}
                  onChange={(e) => setNewAssignment({ ...newAssignment, advisor: e.target.value })}
                  placeholder="Assigned advisor name"
                  className="border-[#004360] focus:border-[#008dd2]"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-[#004360]">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={newAssignment.notes}
                  onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="border-[#004360] focus:border-[#008dd2]"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={addProductToCustomer}
                  className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                  disabled={!newAssignment.customerId || !newAssignment.purchaseDate || !newAssignment.amount}
                >
                  Assign Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddToCustomerOpen(false)
                    setSelectedProduct(null)
                    setNewAssignment({
                      customerId: "",
                      purchaseDate: "",
                      amount: "",
                      status: "active",
                      advisor: "",
                      notes: "",
                    })
                  }}
                  className="flex-1 border-[#004360] text-[#004360]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Assignment Dialog */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#004360]">Edit Product Assignment</DialogTitle>
              <DialogDescription>Update product/service assignment details.</DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div>
                  <Label className="text-[#004360]">Product/Service</Label>
                  <Input value={editingProduct.productName} className="border-[#004360] bg-gray-50" disabled />
                </div>
                <div>
                  <Label className="text-[#004360]">Customer</Label>
                  <Input value={editingProduct.customerName} className="border-[#004360] bg-gray-50" disabled />
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
                    className="border-[#004360] focus:border-[#008dd2]"
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
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div>
                  <Label className="text-[#004360]">Status</Label>
                  <Select
                    value={editingProduct.status}
                    onValueChange={(value) =>
                      setEditingProduct({ ...editingProduct, status: value as CustomerProduct["status"] })
                    }
                  >
                    <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
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
                    className="border-[#004360] focus:border-[#008dd2]"
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
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={updateCustomerProduct} className="flex-1 bg-[#d7af00] text-white">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditProductOpen(false)
                      setEditingProduct(null)
                    }}
                    className="flex-1 border-[#004360] text-[#004360]"
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
