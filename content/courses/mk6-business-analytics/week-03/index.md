---
title: "Week 03: Predictive Analytics for Business"
course: "Applied Business Analytics"
course_code: "MK6"
week: 3
module: "Foundations"
type: "weekly-lecture"
tags:
  - MK6
  - predictive-analytics
  - regression
  - classification
  - machine-learning
---

# Week 03: Predictive Analytics for Business

## 🎯 Executive Summary

Predictive analytics uses statistical learning algorithms to uncover latent patterns in historical data and generate forward-looking probabilistic forecasts. Executives must understand the mechanics of continuous regression, binary classification, and model validation to evaluate predictive accuracy.

---

## 1. Core Modeling Architectures

### 1. Multiple Linear Regression (Continuous Target)

$$Y = \beta_0 + \beta_1 X_1 + \beta_2 X_2 + \dots + \beta_k X_k + \epsilon$$

- **Goodness-of-Fit**: $R^2$ and Adjusted $R^2$ (penalizing redundant feature addition).
- **Diagnostics**: Detecting multicollinearity using the Variance Inflation Factor ($\text{VIF} > 5$ indicates dangerous collinearity), homoskedasticity checks, and residual normality.

### 2. Logistic Regression (Binary Categorical Target)

Predicting probabilities for binary business events (churn/retain, default/repay, convert/bounce):
$$P(Y = 1) = \frac{1}{1 + e^{-(\beta_0 + \sum \beta_i X_i)}} \implies \ln\left(\frac{p}{1 - p}\right) = \beta_0 + \sum \beta_i X_i$$

- Interpreting results via **Odds Ratios** ($e^{\beta_i}$).

### 3. Classification Trees & Ensemble Methods

- **Decision Trees**: Non-linear recursive partitioning based on information gain (Entropy) or Gini impurity.
- **Random Forests & Gradient Boosting (XGBoost)**: Ensembles aggregating hundreds of decision trees to slash variance and boost prediction accuracy.

---

## 2. Model Evaluation & Overfitting

- **Train / Validation / Test Splits**: Never evaluate model accuracy on the data used to train it.
- **The Confusion Matrix**:
  - Precision: $\frac{\text{True Positives}}{\text{True Positives} + \text{False Positives}}$
  - Recall (Sensitivity): $\frac{\text{True Positives}}{\text{True Positives} + \text{False Negatives}}$
  - ROC Curve & Area Under Curve (AUC-ROC).

---

## 🔗 Navigation

- **Previous Session**: [[courses/mk6-business-analytics/week-02/index|Week 02: Data-Driven Culture]]
- **Next Topic**: [[courses/mk6-business-analytics/week-04/index|Week 04: Customer Analytics]]
- Return to [[courses/mk6-business-analytics/index|MK 6 Course Overview]]
