import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from "react-native";

// Types
type Descriptor = "Healthy" | "High Protein" | "Gluten-Free" | "Low Carb" | "Vegan" | "Vegetarian";
type Difficulty = "Easy" | "Medium" | "Hard";

type Ingredient = {
  name: string;
  amount: number | string; // use number for grams/units, string for complex measurements
  unit?: string; // e.g., "g", "ml", "pcs"
  note?: string; // optional notes like "finely chopped"
};

type Recipe = {
  id: string;
  title: string;
  descriptors: Descriptor[];
  difficulty: Difficulty;
  rating: number; // out of 5
  prepTimeMin: number;
  cookTimeMin: number;
  ingredients: Ingredient[];
  instructions: string[];
};

// Sample data (you can load from API later)
const RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Grilled Chicken Bowl",
    descriptors: ["Healthy", "High Protein", "Gluten-Free", "Low Carb"],
    difficulty: "Easy",
    rating: 4.6,
    prepTimeMin: 15,
    cookTimeMin: 20,
    ingredients: [
      { name: "Chicken breast", amount: 300, unit: "g" },
      { name: "Quinoa", amount: 120, unit: "g", note: "rinsed" },
      { name: "Cherry tomatoes", amount: 12, unit: "pcs", note: "halved" },
      { name: "Baby spinach", amount: 60, unit: "g" },
      { name: "Olive oil", amount: 1, unit: "tbsp" },
      { name: "Lemon", amount: 0.5, unit: "pcs" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
      { name: "Black pepper", amount: 0.25, unit: "tsp" },
    ],
    instructions: [
      "Cook quinoa according to package until fluffy (about 12–15 min).",
      "Season chicken with salt, pepper, and a drizzle of olive oil.",
      "Grill or pan-sear chicken over medium heat for 5–6 min per side until cooked through.",
      "Rest chicken for 5 minutes, then slice.",
      "Assemble bowl with quinoa, spinach, tomatoes, and chicken.",
      "Squeeze lemon over the bowl and drizzle remaining olive oil. Adjust salt and pepper to taste.",
    ],
  },
  {
    id: "2",
    title: "Veggie Stir-Fry with Tofu",
    descriptors: ["Healthy", "Vegan", "Gluten-Free"],
    difficulty: "Medium",
    rating: 4.5,
    prepTimeMin: 10,
    cookTimeMin: 12,
    ingredients: [
      { name: "Firm tofu", amount: 250, unit: "g", note: "pressed, cubed" },
      { name: "Broccoli florets", amount: 150, unit: "g" },
      { name: "Red bell pepper", amount: 1, unit: "pcs", note: "sliced" },
      { name: "Carrot", amount: 1, unit: "pcs", note: "julienned" },
      { name: "Garlic", amount: 2, unit: "cloves", note: "minced" },
      { name: "Ginger", amount: 1, unit: "tbsp", note: "grated" },
      { name: "Tamari (GF soy sauce)", amount: 2, unit: "tbsp" },
      { name: "Sesame oil", amount: 1, unit: "tsp" },
      { name: "Neutral oil", amount: 1, unit: "tbsp" },
    ],
    instructions: [
      "Heat neutral oil in a wok/skillet over medium-high heat.",
      "Add tofu; sear each side until golden, 5–7 minutes total. Remove and set aside.",
      "Add broccoli, pepper, and carrot; stir-fry 3–4 minutes.",
      "Add garlic and ginger; cook 30–45 seconds until fragrant.",
      "Return tofu, add tamari and sesame oil; toss to coat 1–2 minutes. Serve hot.",
    ],
  },
  {
    id: "3",
    title: "Whole-Grain Pasta Primavera",
    descriptors: ["Healthy", "Vegetarian"],
    difficulty: "Easy",
    rating: 4.2,
    prepTimeMin: 10,
    cookTimeMin: 15,
    ingredients: [
      { name: "Whole-grain pasta", amount: 200, unit: "g" },
      { name: "Zucchini", amount: 1, unit: "pcs", note: "sliced" },
      { name: "Peas", amount: 80, unit: "g" },
      { name: "Asparagus", amount: 120, unit: "g", note: "trimmed, chopped" },
      { name: "Parmesan", amount: 30, unit: "g", note: "grated" },
      { name: "Olive oil", amount: 1, unit: "tbsp" },
      { name: "Lemon zest", amount: 1, unit: "tsp" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
      { name: "Black pepper", amount: 0.25, unit: "tsp" },
    ],
    instructions: [
      "Cook pasta in salted water until al dente; reserve 1/4 cup pasta water.",
      "Sauté zucchini and asparagus in olive oil for 4–5 minutes.",
      "Add peas; cook 1–2 minutes.",
      "Toss pasta with vegetables, lemon zest, and splash of pasta water.",
      "Fold in Parmesan; season with salt and pepper. Serve warm.",
    ],
  },
  {
    id: "4",
    title: "Greek Yogurt Parfait",
    descriptors: ["Healthy", "High Protein", "Gluten-Free"],
    difficulty: "Easy",
    rating: 4.8,
    prepTimeMin: 5,
    cookTimeMin: 0,
    ingredients: [
      { name: "Greek yogurt (2%)", amount: 200, unit: "g" },
      { name: "Mixed berries", amount: 120, unit: "g" },
      { name: "Honey", amount: 1, unit: "tbsp" },
      { name: "Almonds", amount: 20, unit: "g", note: "chopped" },
      { name: "Chia seeds", amount: 1, unit: "tsp" },
    ],
    instructions: [
      "Layer yogurt, berries, and honey in a glass.",
      "Top with almonds and chia seeds. Serve immediately.",
    ],
  },
  {
    id: "5",
    title: "Cauliflower Rice Burrito Bowl",
    descriptors: ["Healthy", "Low Carb", "Gluten-Free", "Vegetarian"],
    difficulty: "Medium",
    rating: 4.4,
    prepTimeMin: 15,
    cookTimeMin: 10,
    ingredients: [
      { name: "Cauliflower rice", amount: 300, unit: "g" },
      { name: "Black beans", amount: 150, unit: "g", note: "rinsed, drained" },
      { name: "Corn kernels", amount: 80, unit: "g" },
      { name: "Red onion", amount: 0.25, unit: "pcs", note: "diced" },
      { name: "Avocado", amount: 0.5, unit: "pcs", note: "sliced" },
      { name: "Cilantro", amount: 2, unit: "tbsp", note: "chopped" },
      { name: "Lime", amount: 0.5, unit: "pcs" },
      { name: "Cumin", amount: 0.5, unit: "tsp" },
      { name: "Paprika", amount: 0.5, unit: "tsp" },
      { name: "Salt", amount: 0.5, unit: "tsp" },
      { name: "Olive oil", amount: 1, unit: "tbsp" },
    ],
    instructions: [
      "Sauté cauliflower rice in olive oil 4–5 minutes; season with cumin, paprika, and salt.",
      "Warm black beans and corn in a separate pan or microwave.",
      "Assemble bowl with cauliflower rice, beans, corn, onion, avocado, and cilantro.",
      "Squeeze lime over top and serve.",
    ],
  },
];

// Descriptor chips available
const ALL_TAGS: Descriptor[] = ["Healthy", "High Protein", "Gluten-Free", "Low Carb", "Vegan", "Vegetarian"];

// Utilities
const totalTime = (r: Recipe) => r.prepTimeMin + r.cookTimeMin;
const minutes = (m: number) => `${m} min`;
const difficultyColor = (d: Difficulty) => {
  switch (d) {
    case "Easy":
      return "#36B37E";
    case "Medium":
      return "#FFAB00";
    case "Hard":
      return "#FF5630";
    default:
      return "#888";
  }
};

export default function RecommendationsScreen() {
  const [activeTag, setActiveTag] = useState<Descriptor | "All">("All");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const filtered = useMemo(() => {
    if (activeTag === "All") return RECIPES;
    return RECIPES.filter((r) => r.descriptors.includes(activeTag));
  }, [activeTag]);

  const renderTag = (tag: Descriptor | "All") => {
    const active = activeTag === tag;
    return (
      <TouchableOpacity
        key={tag}
        onPress={() => setActiveTag(tag)}
        style={[styles.chip, active && styles.chipActive]}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${tag}`}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>{tag}</Text>
      </TouchableOpacity>
    );
  };

  const renderRecipe = ({ item }: { item: Recipe }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: difficultyColor(item.difficulty) + "22", borderColor: difficultyColor(item.difficulty) }]}>
              <Text style={[styles.badgeText, { color: difficultyColor(item.difficulty) }]}>{item.difficulty}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ {item.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>Prep: {minutes(item.prepTimeMin)}</Text>
          <Text style={styles.meta}>Cook: {minutes(item.cookTimeMin)}</Text>
          <Text style={styles.meta}>Total: {minutes(totalTime(item))}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.descriptorScroll} contentContainerStyle={styles.descriptorContainer}>
          {item.descriptors.map((d) => (
            <View key={`${item.id}-${d}`} style={styles.descriptorPill}>
              <Text style={styles.descriptorText}>{d}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.ingredientsList}>
          {item.ingredients.slice(0, 4).map((ing, idx) => (
            <Text key={`${item.id}-ing-${idx}`} style={styles.ingredientText}>
              • {formatIngredient(ing)}
            </Text>
          ))}
          {item.ingredients.length > 4 && (
            <Text style={styles.moreText}>+ {item.ingredients.length - 4} more</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setSelectedRecipe(item)}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${item.title}`}
          >
            <Text style={styles.primaryButtonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              // Example of second tap target: quick add to plan/favorites
              // Replace with your own handler
              alert(`Added "${item.title}" to your plan`);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.title} to plan`}
          >
            <Text style={styles.secondaryButtonText}>Add to Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.header}>Recommended Recipes</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagBar}
          style={{ marginBottom: 8 }}
        >
          {renderTag("All")}
          {ALL_TAGS.map(renderTag)}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderRecipe}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Details Modal */}
      <Modal
        visible={!!selectedRecipe}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedRecipe(null)}>
          {/* Catch backdrop presses */}
        </Pressable>

        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {selectedRecipe && (
              <>
                <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>

                <View style={styles.modalRow}>
                  <View style={[styles.badge, { backgroundColor: difficultyColor(selectedRecipe.difficulty) + "22", borderColor: difficultyColor(selectedRecipe.difficulty) }]}>
                    <Text style={[styles.badgeText, { color: difficultyColor(selectedRecipe.difficulty) }]}>{selectedRecipe.difficulty}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>⭐ {selectedRecipe.rating.toFixed(1)}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.meta}>Prep: {minutes(selectedRecipe.prepTimeMin)}</Text>
                  <Text style={styles.meta}>Cook: {minutes(selectedRecipe.cookTimeMin)}</Text>
                  <Text style={styles.meta}>Total: {minutes(totalTime(selectedRecipe))}</Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.descriptorScroll}
                  contentContainerStyle={styles.descriptorContainer}
                >
                  {selectedRecipe.descriptors.map((d) => (
                    <View key={`modal-${selectedRecipe.id}-${d}`} style={styles.descriptorPill}>
                      <Text style={styles.descriptorText}>{d}</Text>
                    </View>
                  ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>Ingredients</Text>
                <View style={styles.ingredientsList}>
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <Text key={`modal-ing-${idx}`} style={styles.ingredientText}>
                      • {formatIngredient(ing)}
                    </Text>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Instructions</Text>
                <View style={{ gap: 8 }}>
                  {selectedRecipe.instructions.map((step, idx) => (
                    <View key={`step-${idx}`} style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <Text style={styles.stepIndex}>{idx + 1}.</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ height: 16 }} />
                <TouchableOpacity
                  style={[styles.primaryButton, { alignSelf: "stretch" }]}
                  onPress={() => {
                    alert(`Saved "${selectedRecipe.title}"`);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Save ${selectedRecipe.title}`}
                >
                  <Text style={styles.primaryButtonText}>Save Recipe</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setSelectedRecipe(null)}
            accessibilityRole="button"
            accessibilityLabel="Close recipe details"
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helpers
function formatIngredient(i: Ingredient) {
  const qty = typeof i.amount === "number" ? i.amount : i.amount;
  const unit = i.unit ? ` ${i.unit}` : "";
  const note = i.note ? ` (${i.note})` : "";
  return `${qty}${unit} ${i.name}${note}`;
}

// Styles
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E6EDF3",
    marginTop: Platform.select({ ios: 8, android: 16, default: 16 }),
    marginBottom: 8,
  },
  tagBar: {
    paddingVertical: 8,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#1B2631",
    borderWidth: 1,
    borderColor: "#2C3E50",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: "#2563EB22",
    borderColor: "#2563EB",
  },
  chipText: {
    color: "#C8D1DA",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#E5F0FF",
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#223047",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E6EDF3",
    flex: 1,
    paddingRight: 12,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "#334155",
  },
  badgeText: {
    color: "#C8D1DA",
    fontSize: 12,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  meta: {
    color: "#9AA7B2",
    fontSize: 13,
  },
  descriptorScroll: {
    marginVertical: 6,
  },
  descriptorContainer: {
    gap: 6,
  },
  descriptorPill: {
    backgroundColor: "#0E1726",
    borderWidth: 1,
    borderColor: "#253449",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  descriptorText: {
    fontSize: 12,
    color: "#C8D1DA",
    fontWeight: "500",
  },
  sectionTitle: {
    color: "#DCE6EF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 6,
  },
  ingredientsList: {
    gap: 4,
    marginBottom: 12,
  },
  ingredientText: {
    color: "#B9C6D3",
    fontSize: 14,
    lineHeight: 20,
  },
  moreText: {
    color: "#8FA3B8",
    fontSize: 13,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3B4860",
    backgroundColor: "#0E1726",
  },
  secondaryButtonText: {
    color: "#C8D1DA",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000088",
  },
  modalCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "85%",
    backgroundColor: "#0D1420",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#223047",
  },
  modalHandle: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#2B3A4D",
    marginBottom: 8,
  },
  modalTitle: {
    color: "#E6EDF3",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  stepIndex: {
    width: 22,
    color: "#9FB0C3",
    fontWeight: "700",
    marginRight: 6,
    marginTop: 1,
  },
  stepText: {
    flex: 1,
    color: "#C9D6E2",
    lineHeight: 20,
  },
  modalClose: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#223047",
  },
  modalCloseText: {
    color: "#9FB0C3",
    fontWeight: "700",
  },
});